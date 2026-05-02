import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { OAuthUserDto } from '../dto/oauth-user.dto';
import { RedisService } from '../../redis/redis.service';
import { RedisOAuthStateStore } from '../oauth/redis-state-store';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    redisService: RedisService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      // CSRF 방어: state를 Redis 기반 store로 발급/검증 (세션 미들웨어 불필요)
      // @types/passport-google-oauth20에 store 옵션 누락되어 있어 타입 캐스트.
      // 런타임에서는 passport-oauth2 부모가 store 옵션을 정상 처리.
      store: new RedisOAuthStateStore(redisService, 'google'),
    } as unknown as ConstructorParameters<typeof Strategy>[0]);
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const { id, emails, displayName, photos } = profile;

    const user: OAuthUserDto = {
      provider: 'google',
      providerId: id,
      email: emails?.[0]?.value || '',
      nickname: displayName || '',
      profileImage: photos?.[0]?.value,
    };

    done(null, user);
  }
}
