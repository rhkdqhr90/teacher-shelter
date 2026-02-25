import type { LoggerService } from '@nestjs/common';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ExchangeOAuthCodeDto } from './dto/exchange-oauth-code.dto';
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    private readonly logger;
    constructor(authService: AuthService, configService: ConfigService, logger: LoggerService);
    register(registerDto: RegisterDto, res: Response): Promise<{
        accessToken: string;
    }>;
    login(loginDto: LoginDto, res: Response): Promise<{
        accessToken: string;
    }>;
    refresh(req: Request, res: Response): Promise<{
        accessToken: string;
    }>;
    logout(req: Request, res: Response): Promise<void>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    verifyEmail(req: Request, verifyEmailDto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    resendVerificationEmail(req: Request): Promise<{
        message: string;
    }>;
    googleLogin(): void;
    googleCallback(req: Request, res: Response): Promise<void>;
    kakaoLogin(): void;
    kakaoCallback(req: Request, res: Response): Promise<void>;
    naverLogin(): void;
    naverCallback(req: Request, res: Response): Promise<void>;
    exchangeOAuthCode(dto: ExchangeOAuthCodeDto): Promise<{
        accessToken: string;
    }>;
    private readonly ALLOWED_REDIRECT_ORIGINS;
    private validateRedirectUrl;
    private handleOAuthCallback;
    private setRefreshTokenCookie;
}
