"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../database/prisma.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    configService;
    prisma;
    constructor(configService, prisma) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow('jwt.secret'),
            passReqToCallback: true,
        });
        this.configService = configService;
        this.prisma = prisma;
    }
    async validate(req, payload) {
        if (!payload.sub ||
            !Object.values(client_1.UserRole).includes(payload.role)) {
            throw new common_1.UnauthorizedException('유효하지 않은 토큰입니다');
        }
        const tokenIssuedAt = new Date((payload.iat || 0) * 1000);
        const blacklistEntry = await this.prisma.tokenBlacklist.findFirst({
            where: {
                userId: payload.sub,
                revokedAt: {
                    gte: tokenIssuedAt,
                },
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
        if (blacklistEntry) {
            throw new common_1.UnauthorizedException('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { isBanned: true, bannedUntil: true },
        });
        if (user?.isBanned) {
            if (!user.bannedUntil || user.bannedUntil > new Date()) {
                throw new common_1.UnauthorizedException('계정이 정지되었습니다. 관리자에게 문의하세요.');
            }
        }
        return {
            sub: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map