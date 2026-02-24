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
exports.NaverStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_naver_v2_1 = require("passport-naver-v2");
const config_1 = require("@nestjs/config");
const NaverStrategyBase = (0, passport_1.PassportStrategy)(passport_naver_v2_1.Strategy, 'naver');
let NaverStrategy = class NaverStrategy extends NaverStrategyBase {
    configService;
    constructor(configService) {
        super({
            clientID: configService.getOrThrow('NAVER_CLIENT_ID'),
            clientSecret: configService.getOrThrow('NAVER_CLIENT_SECRET'),
            callbackURL: configService.getOrThrow('NAVER_CALLBACK_URL'),
        });
        this.configService = configService;
    }
    async validate(accessToken, refreshToken, profile, done) {
        const { id, email, nickname, profileImage } = profile;
        const user = {
            provider: 'naver',
            providerId: id,
            email: email || '',
            nickname: nickname || '',
            profileImage: profileImage,
        };
        done(null, user);
    }
};
exports.NaverStrategy = NaverStrategy;
exports.NaverStrategy = NaverStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NaverStrategy);
//# sourceMappingURL=naver.strategy.js.map