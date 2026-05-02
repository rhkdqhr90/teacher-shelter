import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-naver-v2';
import { ConfigService } from '@nestjs/config';
import { OAuthUserDto } from '../dto/oauth-user.dto';
import { RedisService } from '../../redis/redis.service';
import { RedisOAuthStateStore } from '../oauth/redis-state-store';

// Naver 전략을 위한 베이스 클래스
const NaverStrategyBase = PassportStrategy(Strategy, 'naver');

@Injectable()
export class NaverStrategy extends NaverStrategyBase {
  constructor(
    private configService: ConfigService,
    redisService: RedisService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('NAVER_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('NAVER_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('NAVER_CALLBACK_URL'),
      // CSRF 방어: Redis 기반 state store (타입 정의 누락으로 캐스트)
      store: new RedisOAuthStateStore(redisService, 'naver'),
    } as unknown as ConstructorParameters<typeof Strategy>[0]);
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ): void {
    const { id, email, nickname, profileImage } = profile;

    const user: OAuthUserDto = {
      provider: 'naver',
      providerId: id,
      email: email || '',
      nickname: nickname || '',
      profileImage: profileImage,
    };

    done(null, user);
  }
}
