import { Strategy, Profile } from 'passport-naver-v2';
import { ConfigService } from '@nestjs/config';
declare const NaverStrategyBase: new (options: Partial<import("passport-oauth2").StrategyOptions>) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class NaverStrategy extends NaverStrategyBase {
    private configService;
    constructor(configService: ConfigService);
    validate(accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void): void;
}
export {};
