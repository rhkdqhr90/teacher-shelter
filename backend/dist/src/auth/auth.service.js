"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const nest_winston_1 = require("nest-winston");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../database/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const mail_service_1 = require("../mail/mail.service");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    mailService;
    redisService;
    logger;
    SALT_ROUNDS = 10;
    REFRESH_TOKEN_EXPIRY_DAYS = 7;
    PASSWORD_RESET_EXPIRY_HOURS = 1;
    EMAIL_VERIFICATION_EXPIRY_MINUTES = 10;
    OAUTH_CODE_EXPIRY_SECONDS = 60;
    OAUTH_CODE_PREFIX = 'oauth:code:';
    MAX_OAUTH_CODES = 1000;
    oauthCodeFallback = new Map();
    constructor(prisma, jwtService, configService, mailService, redisService, logger) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailService = mailService;
        this.redisService = redisService;
        this.logger = logger;
    }
    async register(registerDto) {
        if (!registerDto.agreedTerms || !registerDto.agreedPrivacy) {
            throw new common_1.BadRequestException('이용약관과 개인정보처리방침에 동의해주세요.');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('회원가입에 실패했습니다. 다시 시도하거나 다른 이메일을 사용해주세요.');
        }
        const hashedPassword = await this.hashPassword(registerDto.password);
        const now = new Date();
        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                nickname: registerDto.nickname,
                provider: 'local',
                jobType: registerDto.jobType,
                career: registerDto.career,
                isVerified: false,
                termsAgreedAt: now,
                privacyAgreedAt: now,
            },
        });
        try {
            await this.sendVerificationEmail(user.id, user.email, user.nickname);
        }
        catch (error) {
            this.logger.error('Failed to send verification email', error, 'AuthService');
        }
        return this.generateAndSaveTokens(user.id, user.email, user.role);
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        return this.generateAndSaveTokens(user.id, user.email, user.role);
    }
    async oauthLogin(oauthUser) {
        const user = await this.findOrCreateOAuthUser(oauthUser);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        return this.generateAndSaveTokens(user.id, user.email, user.role);
    }
    async findOrCreateOAuthUser(data) {
        let user = await this.prisma.user.findUnique({
            where: {
                provider_providerId: {
                    provider: data.provider,
                    providerId: data.providerId,
                },
            },
        });
        if (user) {
            return user;
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            const providerName = existingUser.provider === 'local'
                ? '이메일/비밀번호'
                : existingUser.provider === 'google'
                    ? '구글'
                    : existingUser.provider === 'kakao'
                        ? '카카오'
                        : existingUser.provider === 'naver'
                            ? '네이버'
                            : existingUser.provider;
            throw new common_1.ConflictException(`이미 ${providerName}로 가입된 이메일입니다. 해당 방식으로 로그인해주세요.`);
        }
        const now = new Date();
        user = await this.prisma.user.create({
            data: {
                email: data.email,
                nickname: data.nickname,
                provider: data.provider,
                providerId: data.providerId,
                profileImage: data.profileImage,
                password: null,
                isVerified: true,
                termsAgreedAt: now,
                privacyAgreedAt: now,
            },
        });
        return user;
    }
    async refresh(userId, oldRefreshToken) {
        const tokenHash = this.hashToken(oldRefreshToken);
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
        if (!storedToken) {
            throw new common_1.UnauthorizedException('유효하지 않은 토큰입니다');
        }
        if (storedToken.revokedAt) {
            throw new common_1.UnauthorizedException('토큰이 무효화되었습니다');
        }
        if (storedToken.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('토큰이 만료되었습니다');
        }
        if (storedToken.userId !== userId) {
            throw new common_1.UnauthorizedException('사용자 정보가 일치하지 않습니다');
        }
        const { user } = storedToken;
        const payload = { sub: user.id, email: user.email, role: user.role };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.getOrThrow('jwt.secret'),
                expiresIn: this.configService.get('jwt.expiresIn') || '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.getOrThrow('jwt.refreshSecret'),
                expiresIn: this.configService.get('jwt.refreshExpiresIn') ||
                    `${this.REFRESH_TOKEN_EXPIRY_DAYS}d`,
            }),
        ]);
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);
        await this.prisma.$transaction([
            this.prisma.refreshToken.update({
                where: { tokenHash },
                data: { revokedAt: new Date() },
            }),
            this.prisma.refreshToken.create({
                data: {
                    tokenHash: this.hashToken(refreshToken),
                    userId: user.id,
                    expiresAt: newExpiresAt,
                },
            }),
        ]);
        return { accessToken, refreshToken };
    }
    async logout(refreshToken) {
        const tokenHash = this.hashToken(refreshToken);
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
            select: { userId: true, revokedAt: true },
        });
        if (!storedToken || storedToken.revokedAt) {
            return;
        }
        const userId = storedToken.userId;
        await this.prisma.$transaction([
            this.prisma.refreshToken.update({
                where: { tokenHash },
                data: { revokedAt: new Date() },
            }),
            this.prisma.tokenBlacklist.create({
                data: {
                    userId,
                    expiresAt: this.calculateAccessTokenExpiry(),
                    revokedAt: new Date(),
                },
            }),
        ]);
    }
    async blacklistFromAccessToken(authHeader) {
        if (!authHeader?.startsWith('Bearer '))
            return;
        try {
            const token = authHeader.substring(7);
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.getOrThrow('jwt.secret'),
            });
            if (!payload.sub)
                return;
            await this.prisma.tokenBlacklist.create({
                data: {
                    userId: payload.sub,
                    expiresAt: this.calculateAccessTokenExpiry(),
                    revokedAt: new Date(),
                },
            });
        }
        catch {
        }
    }
    calculateAccessTokenExpiry() {
        const expiry = new Date();
        const expiresIn = this.configService.get('jwt.expiresIn') || '15m';
        const match = expiresIn.match(/^(\d+)([mhd])$/);
        if (match) {
            const value = parseInt(match[1], 10);
            const unit = match[2];
            if (unit === 'm')
                expiry.setMinutes(expiry.getMinutes() + value);
            else if (unit === 'h')
                expiry.setHours(expiry.getHours() + value);
            else if (unit === 'd')
                expiry.setDate(expiry.getDate() + value);
        }
        else {
            expiry.setMinutes(expiry.getMinutes() + 15);
        }
        return expiry;
    }
    generateVerificationCode() {
        const randomBytes = crypto.randomBytes(3);
        const code = (parseInt(randomBytes.toString('hex'), 16) % 900000) + 100000;
        return code.toString();
    }
    async sendVerificationEmail(userId, email, nickname) {
        await this.prisma.emailVerificationToken.updateMany({
            where: {
                userId,
                verifiedAt: null,
            },
            data: {
                verifiedAt: new Date(),
            },
        });
        const code = this.generateVerificationCode();
        const tokenHash = this.hashToken(code);
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + this.EMAIL_VERIFICATION_EXPIRY_MINUTES);
        await this.prisma.emailVerificationToken.create({
            data: {
                tokenHash,
                userId,
                expiresAt,
            },
        });
        await this.mailService.sendEmailVerificationCode(email, code, nickname);
        if (process.env.NODE_ENV === 'development') {
            this.logger.log(`[DEV] Email verification code for ${email}: ${code}`, 'AuthService');
        }
    }
    async verifyEmail(userId, code) {
        if (!/^\d{6}$/.test(code)) {
            throw new common_1.BadRequestException('6자리 숫자 코드를 입력해주세요');
        }
        const latestToken = await this.prisma.emailVerificationToken.findFirst({
            where: {
                userId,
                verifiedAt: null,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
            include: { user: true },
        });
        if (!latestToken) {
            throw new common_1.BadRequestException('유효한 인증 코드가 없습니다. 인증 코드를 다시 요청해주세요.');
        }
        if (latestToken.attempts >= latestToken.maxAttempts) {
            await this.prisma.emailVerificationToken.update({
                where: { id: latestToken.id },
                data: { verifiedAt: new Date() },
            });
            throw new common_1.BadRequestException('인증 시도 횟수를 초과했습니다. 인증 코드를 다시 요청해주세요.');
        }
        await this.prisma.emailVerificationToken.update({
            where: { id: latestToken.id },
            data: { attempts: { increment: 1 } },
        });
        const tokenHash = this.hashToken(code);
        if (latestToken.tokenHash !== tokenHash) {
            const remainingAttempts = latestToken.maxAttempts - latestToken.attempts - 1;
            if (remainingAttempts <= 0) {
                await this.prisma.emailVerificationToken.update({
                    where: { id: latestToken.id },
                    data: { verifiedAt: new Date() },
                });
                throw new common_1.BadRequestException('인증 시도 횟수를 초과했습니다. 인증 코드를 다시 요청해주세요.');
            }
            throw new common_1.BadRequestException(`잘못된 인증 코드입니다 (남은 시도: ${remainingAttempts}회)`);
        }
        if (latestToken.user.isVerified) {
            return { message: '이미 인증된 계정입니다' };
        }
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: latestToken.userId },
                data: { isVerified: true },
            }),
            this.prisma.emailVerificationToken.update({
                where: { id: latestToken.id },
                data: { verifiedAt: new Date() },
            }),
        ]);
        return { message: '이메일 인증이 완료되었습니다' };
    }
    async resendVerificationEmail(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.BadRequestException('사용자를 찾을 수 없습니다');
        }
        if (user.isVerified) {
            throw new common_1.BadRequestException('이미 인증된 계정입니다');
        }
        await this.sendVerificationEmail(user.id, user.email, user.nickname);
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return;
        }
        if (!user.password) {
            return;
        }
        await this.prisma.passwordResetToken.updateMany({
            where: {
                userId: user.id,
                usedAt: null,
            },
            data: {
                usedAt: new Date(),
            },
        });
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = this.hashToken(token);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + this.PASSWORD_RESET_EXPIRY_HOURS);
        await this.prisma.passwordResetToken.create({
            data: {
                tokenHash,
                userId: user.id,
                expiresAt,
            },
        });
        await this.mailService.sendPasswordResetEmail(user.email, token, user.nickname);
    }
    async resetPassword(token, newPassword) {
        const tokenHash = this.hashToken(token);
        const resetToken = await this.prisma.passwordResetToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
        if (!resetToken) {
            throw new common_1.BadRequestException('유효하지 않은 토큰입니다');
        }
        if (resetToken.usedAt) {
            throw new common_1.BadRequestException('이미 사용된 토큰입니다');
        }
        if (resetToken.expiresAt < new Date()) {
            throw new common_1.BadRequestException('토큰이 만료되었습니다');
        }
        const hashedPassword = await this.hashPassword(newPassword);
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: resetToken.userId },
                data: { password: hashedPassword },
            }),
            this.prisma.passwordResetToken.update({
                where: { tokenHash },
                data: { usedAt: new Date() },
            }),
            this.prisma.refreshToken.updateMany({
                where: {
                    userId: resetToken.userId,
                    revokedAt: null,
                },
                data: {
                    revokedAt: new Date(),
                },
            }),
            this.prisma.tokenBlacklist.create({
                data: {
                    userId: resetToken.userId,
                    expiresAt: this.calculateAccessTokenExpiry(),
                    revokedAt: new Date(),
                    reason: 'password_reset',
                },
            }),
        ]);
    }
    async validateUser(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        const dummyHash = '$2b$10$N9qo8uLOickgx2ZMRZoMy.MqrqQqPDkq5CzFsKjEqW3NzY6qK1Yxa';
        const passwordToCompare = user?.password || dummyHash;
        const isPasswordValid = await this.comparePassword(password, passwordToCompare);
        if (!user || !isPasswordValid) {
            throw new common_1.UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');
        }
        if (!user.password) {
            throw new common_1.UnauthorizedException('소셜 로그인으로 가입된 계정입니다. 해당 소셜 로그인을 이용해주세요.');
        }
        if (user.isBanned) {
            if (user.bannedUntil && user.bannedUntil <= new Date()) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        isBanned: false,
                        bannedAt: null,
                        bannedUntil: null,
                        banReason: null,
                    },
                });
            }
            else {
                const banMessage = this.getBanMessage(user.bannedUntil, user.banReason);
                throw new common_1.UnauthorizedException(banMessage);
            }
        }
        return user;
    }
    getBanMessage(bannedUntil, banReason) {
        if (!bannedUntil) {
            return `계정이 영구 정지되었습니다.${banReason ? ` 사유: ${banReason}` : ''}`;
        }
        const now = new Date();
        if (bannedUntil <= now) {
            return '';
        }
        const untilStr = bannedUntil.toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
        return `계정이 ${untilStr}까지 정지되었습니다.${banReason ? ` 사유: ${banReason}` : ''}`;
    }
    async generateAndSaveTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.getOrThrow('jwt.secret'),
                expiresIn: this.configService.get('jwt.expiresIn') || '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.getOrThrow('jwt.refreshSecret'),
                expiresIn: this.configService.get('jwt.refreshExpiresIn') ||
                    `${this.REFRESH_TOKEN_EXPIRY_DAYS}d`,
            }),
        ]);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);
        await this.prisma.refreshToken.create({
            data: {
                tokenHash: this.hashToken(refreshToken),
                userId,
                expiresAt,
            },
        });
        return {
            accessToken,
            refreshToken,
        };
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    async hashPassword(password) {
        return bcrypt.hash(password, this.SALT_ROUNDS);
    }
    async comparePassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
    async generateOAuthCode(accessToken) {
        const code = crypto.randomBytes(32).toString('hex');
        if (this.redisService.isConnected()) {
            await this.redisService.set(`${this.OAUTH_CODE_PREFIX}${code}`, accessToken, this.OAUTH_CODE_EXPIRY_SECONDS);
        }
        else {
            this.logger.warn('Redis unavailable, using in-memory OAuth code cache', 'AuthService');
            this.cleanupExpiredFallbackCodes();
            if (this.oauthCodeFallback.size >= this.MAX_OAUTH_CODES) {
                const entries = Array.from(this.oauthCodeFallback.entries());
                entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);
                const toDelete = entries.slice(0, Math.floor(this.MAX_OAUTH_CODES / 2));
                toDelete.forEach(([key]) => this.oauthCodeFallback.delete(key));
            }
            this.oauthCodeFallback.set(code, {
                accessToken,
                expiresAt: Date.now() + this.OAUTH_CODE_EXPIRY_SECONDS * 1000,
            });
        }
        return code;
    }
    async exchangeOAuthCode(code) {
        if (this.redisService.isConnected()) {
            const redisKey = `${this.OAUTH_CODE_PREFIX}${code}`;
            const accessToken = await this.redisService.get(redisKey);
            if (!accessToken) {
                throw new common_1.BadRequestException('유효하지 않은 코드입니다');
            }
            await this.redisService.del(redisKey);
            return accessToken;
        }
        const cached = this.oauthCodeFallback.get(code);
        if (!cached) {
            throw new common_1.BadRequestException('유효하지 않은 코드입니다');
        }
        if (cached.expiresAt < Date.now()) {
            this.oauthCodeFallback.delete(code);
            throw new common_1.BadRequestException('코드가 만료되었습니다');
        }
        this.oauthCodeFallback.delete(code);
        return cached.accessToken;
    }
    cleanupExpiredFallbackCodes() {
        const now = Date.now();
        for (const [code, data] of this.oauthCodeFallback.entries()) {
            if (data.expiresAt < now) {
                this.oauthCodeFallback.delete(code);
            }
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_1.MailService,
        redis_service_1.RedisService, Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map