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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const nest_winston_1 = require("nest-winston");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const register_dto_1 = require("./dto/register.dto");
const forgot_password_dto_1 = require("./dto/forgot-password.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const verify_email_dto_1 = require("./dto/verify-email.dto");
const exchange_oauth_code_dto_1 = require("./dto/exchange-oauth-code.dto");
const refresh_auth_guard_1 = require("./guards/refresh-auth.guard");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
let AuthController = class AuthController {
    authService;
    configService;
    logger;
    constructor(authService, configService, logger) {
        this.authService = authService;
        this.configService = configService;
        this.logger = logger;
    }
    async register(registerDto, res) {
        const { accessToken, refreshToken } = await this.authService.register(registerDto);
        this.setRefreshTokenCookie(res, refreshToken);
        return { accessToken };
    }
    async login(loginDto, res) {
        const { accessToken, refreshToken } = await this.authService.login(loginDto);
        this.setRefreshTokenCookie(res, refreshToken);
        return { accessToken };
    }
    async refresh(req, res) {
        const user = req.user;
        const { accessToken, refreshToken } = await this.authService.refresh(user.id, user.refreshToken);
        this.setRefreshTokenCookie(res, refreshToken);
        return { accessToken };
    }
    async logout(req, res) {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            await this.authService.logout(refreshToken);
        }
        else {
            await this.authService.blacklistFromAccessToken(req.headers.authorization);
        }
        const isProduction = process.env.NODE_ENV === 'production';
        if (isProduction) {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                path: '/',
            });
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                path: '/',
                domain: '.teacherlounge.co.kr',
            });
        }
        else {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                path: '/',
            });
        }
    }
    async forgotPassword(forgotPasswordDto) {
        await this.authService.forgotPassword(forgotPasswordDto.email);
        return {
            message: '이메일이 등록되어 있다면 비밀번호 재설정 링크가 발송됩니다.',
        };
    }
    async resetPassword(resetPasswordDto) {
        await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
        return { message: '비밀번호가 성공적으로 변경되었습니다.' };
    }
    async verifyEmail(req, verifyEmailDto) {
        const user = req.user;
        return await this.authService.verifyEmail(user.sub, verifyEmailDto.code);
    }
    async resendVerificationEmail(req) {
        const user = req.user;
        await this.authService.resendVerificationEmail(user.sub);
        return { message: '인증 메일이 재발송되었습니다.' };
    }
    googleLogin() {
    }
    async googleCallback(req, res) {
        return this.handleOAuthCallback(req, res);
    }
    kakaoLogin() {
    }
    async kakaoCallback(req, res) {
        return this.handleOAuthCallback(req, res);
    }
    naverLogin() {
    }
    async naverCallback(req, res) {
        return this.handleOAuthCallback(req, res);
    }
    async exchangeOAuthCode(dto) {
        const accessToken = await this.authService.exchangeOAuthCode(dto.code);
        return { accessToken };
    }
    ALLOWED_REDIRECT_ORIGINS = [
        'http://localhost:3001',
        'http://127.0.0.1:3001',
    ];
    validateRedirectUrl(url) {
        try {
            const parsedUrl = new URL(url);
            const origin = parsedUrl.origin;
            const frontendUrl = this.configService.get('FRONTEND_URL');
            const allowedOrigins = [...this.ALLOWED_REDIRECT_ORIGINS];
            if (frontendUrl) {
                try {
                    const frontendOrigin = new URL(frontendUrl).origin;
                    allowedOrigins.push(frontendOrigin);
                }
                catch {
                }
            }
            if (!allowedOrigins.includes(origin)) {
                this.logger.warn(`Blocked redirect to untrusted origin: ${origin}`, 'AuthController');
                return frontendUrl || 'http://localhost:3001';
            }
            return url;
        }
        catch {
            return (this.configService.get('FRONTEND_URL') ||
                'http://localhost:3001');
        }
    }
    async handleOAuthCallback(req, res) {
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3001';
        const safeRedirectBase = this.validateRedirectUrl(frontendUrl);
        try {
            const oauthUser = req.user;
            const { accessToken, refreshToken } = await this.authService.oauthLogin(oauthUser);
            this.setRefreshTokenCookie(res, refreshToken);
            const code = await this.authService.generateOAuthCode(accessToken);
            return res.redirect(`${safeRedirectBase}/login/callback?code=${code}`);
        }
        catch (error) {
            this.logger.error(`OAuth callback failed: ${error instanceof Error ? error.message : error}`, 'AuthController');
            const errorCode = error instanceof common_1.ConflictException ? 'account_exists' : 'login_failed';
            return res.redirect(`${safeRedirectBase}/login/callback?error=${errorCode}`);
        }
    }
    setRefreshTokenCookie(res, refreshToken) {
        const isProduction = process.env.NODE_ENV === 'production';
        if (isProduction) {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                path: '/',
            });
        }
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            domain: isProduction ? '.teacherlounge.co.kr' : undefined,
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({
        summary: '회원가입',
        description: '이메일과 비밀번호로 새 계정을 생성합니다.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '회원가입 성공, accessToken 반환' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '유효하지 않은 입력' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: '이미 존재하는 이메일' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, throttler_1.Throttle)({ strict: { ttl: 900000, limit: 3 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({
        summary: '로그인',
        description: '이메일과 비밀번호로 로그인합니다.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '로그인 성공, accessToken 반환' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '잘못된 이메일 또는 비밀번호' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ strict: { ttl: 900000, limit: 5 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({
        summary: '토큰 갱신',
        description: 'refreshToken으로 새 accessToken을 발급받습니다.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '토큰 갱신 성공' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '유효하지 않은 refreshToken' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(refresh_auth_guard_1.RefreshAuthGuard),
    (0, throttler_1.Throttle)({ default: { ttl: 60000, limit: 10 } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiOperation)({
        summary: '로그아웃',
        description: 'refreshToken을 무효화하고 accessToken을 블랙리스트에 추가합니다.',
    }),
    (0, swagger_1.ApiResponse)({ status: 204, description: '로그아웃 성공' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, swagger_1.ApiOperation)({
        summary: '비밀번호 찾기',
        description: '비밀번호 재설정 이메일을 발송합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '이메일 발송 완료 (존재 여부 무관)',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { ttl: 60000, limit: 3 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, swagger_1.ApiOperation)({
        summary: '비밀번호 재설정',
        description: '토큰으로 비밀번호를 재설정합니다.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '비밀번호 변경 성공' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '유효하지 않거나 만료된 토큰' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { ttl: 60000, limit: 5 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('verify-email'),
    (0, swagger_1.ApiOperation)({
        summary: '이메일 인증',
        description: '인증 코드로 이메일을 인증합니다.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '이메일 인증 성공' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '유효하지 않거나 만료된 코드' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.Throttle)({ strict: { ttl: 900000, limit: 10 } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, verify_email_dto_1.VerifyEmailDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('resend-verification'),
    (0, swagger_1.ApiOperation)({
        summary: '인증 이메일 재발송',
        description: '이메일 인증 메일을 재발송합니다.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '이메일 재발송 성공' }),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.Throttle)({ default: { ttl: 300000, limit: 3 } }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendVerificationEmail", null);
__decorate([
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "googleLogin", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleCallback", null);
__decorate([
    (0, common_1.Get)('kakao'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('kakao')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "kakaoLogin", null);
__decorate([
    (0, common_1.Get)('kakao/callback'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('kakao')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "kakaoCallback", null);
__decorate([
    (0, common_1.Get)('naver'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('naver')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "naverLogin", null);
__decorate([
    (0, common_1.Get)('naver/callback'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('naver')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "naverCallback", null);
__decorate([
    (0, common_1.Post)('oauth/exchange'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { ttl: 60000, limit: 10 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [exchange_oauth_code_dto_1.ExchangeOAuthCodeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "exchangeOAuthCode", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __param(2, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER)),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService, Object])
], AuthController);
//# sourceMappingURL=auth.controller.js.map