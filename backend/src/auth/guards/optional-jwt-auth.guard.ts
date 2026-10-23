import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 토큰이 있으면 검증하여 req.user를 채우고, 없거나 유효하지 않아도 요청을 막지 않는다.
 * 회원/비회원 모두 허용하되 회원이면 신원을 신뢰할 수 있는 엔드포인트에 사용.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(_err: unknown, user: unknown): TUser {
    return (user || null) as TUser;
  }
}
