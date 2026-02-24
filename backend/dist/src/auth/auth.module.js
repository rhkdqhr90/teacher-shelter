"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const refresh_strategy_1 = require("./strategies/refresh.strategy");
const google_strategy_1 = require("./strategies/google.strategy");
const kakao_strategy_1 = require("./strategies/kakao.strategy");
const naver_strategy_1 = require("./strategies/naver.strategy");
const token_cleanup_service_1 = require("./token-cleanup.service");
const mail_module_1 = require("../mail/mail.module");
const jwt_config_1 = __importDefault(require("../config/jwt.config"));
const oauthProviders = [];
if (process.env.GOOGLE_CLIENT_ID) {
    oauthProviders.push(google_strategy_1.GoogleStrategy);
}
if (process.env.KAKAO_CLIENT_ID) {
    oauthProviders.push(kakao_strategy_1.KakaoStrategy);
}
if (process.env.NAVER_CLIENT_ID) {
    oauthProviders.push(naver_strategy_1.NaverStrategy);
}
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forFeature(jwt_config_1.default),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    secret: configService.getOrThrow('jwt.secret'),
                    signOptions: {
                        expiresIn: configService.get('jwt.expiresIn') || '15m',
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            mail_module_1.MailModule,
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            refresh_strategy_1.RefreshStrategy,
            ...oauthProviders,
            token_cleanup_service_1.TokenCleanupService,
        ],
        exports: [jwt_strategy_1.JwtStrategy, passport_1.PassportModule, auth_service_1.AuthService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map