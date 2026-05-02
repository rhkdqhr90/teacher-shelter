import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';
import { OAuthUserDto } from '../dto/oauth-user.dto';
import { RedisService } from '../../redis/redis.service';
import { RedisOAuthStateStore } from '../oauth/redis-state-store';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    private configService: ConfigService,
    redisService: RedisService,
  ) {
    // passport-kakao는 내부적으로 passport-oauth2를 상속하므로 `store` 옵션을 지원하지만
    // @types/passport-kakao 정의에는 누락되어 있어 타입 캐스트 필요.
    super({
      clientID: configService.getOrThrow<string>('KAKAO_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('KAKAO_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('KAKAO_CALLBACK_URL'),
      // CSRF 방어: Redis 기반 state store
      store: new RedisOAuthStateStore(redisService, 'kakao'),
    } as unknown as ConstructorParameters<typeof Strategy>[0]);
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ): void {
    const { id, _json } = profile;
    const kakaoAccount = _json?.kakao_account;
    const properties = _json?.properties;

    const user: OAuthUserDto = {
      provider: 'kakao',
      providerId: id.toString(),
      email: kakaoAccount?.email || '',
      nickname: properties?.nickname || kakaoAccount?.profile?.nickname || '',
      profileImage:
        properties?.profile_image || kakaoAccount?.profile?.profile_image_url,
    };

    done(null, user);
  }
}
