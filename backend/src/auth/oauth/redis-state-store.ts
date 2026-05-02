import * as crypto from 'crypto';
import type { Request } from 'express';
import type { RedisService } from '../../redis/redis.service';

/**
 * passport-oauth2 호환 OAuth state 저장소 (Redis 기반)
 *
 * 목적: OAuth 인가 요청에 무작위 state 파라미터를 첨부하고
 * 콜백에서 동일성을 검증해 CSRF (인가 코드 교차 주입) 공격을 차단한다.
 *
 * 왜 express-session 대신 Redis를 쓰나
 *  - 새 환경변수(SESSION_SECRET) 불필요
 *  - 새 의존성(express-session) 불필요
 *  - 멀티 인스턴스 환경에서도 자연스럽게 공유됨
 *  - 기존 OAuth 임시 코드 패턴(`oauth:code:`)과 일관
 *
 * passport-oauth2 store 인터페이스
 *   store(req, [meta], callback(err, state))
 *   verify(req, providedState, callback(err, ok, state))
 * meta 인자는 라이브러리 버전에 따라 있을 수도/없을 수도 있어 양쪽 시그니처 모두 처리.
 */

const KEY_PREFIX = 'oauth:state:';
const STATE_TTL_SECONDS = 600; // 10분 — OAuth 동의 화면 체류 시간 충분

type StoreCallback = (err: Error | null, state?: string) => void;
type VerifyCallback = (
  err: Error | null,
  ok: boolean,
  state?: string | { message: string },
) => void;

export class RedisOAuthStateStore {
  constructor(
    private readonly redisService: RedisService,
    private readonly providerKey: string,
  ) {}

  /**
   * 새 state 생성 → Redis에 저장 → state 문자열을 콜백으로 전달.
   * 라이브러리는 이 값을 OAuth 인가 URL의 ?state= 파라미터로 첨부한다.
   *
   * 시그니처 두 가지 지원:
   *   - store(req, callback)
   *   - store(req, meta, callback)  // 신버전
   */
  store(
    req: Request,
    metaOrCallback: unknown,
    maybeCallback?: StoreCallback,
  ): void {
    const callback: StoreCallback =
      typeof metaOrCallback === 'function'
        ? (metaOrCallback as StoreCallback)
        : (maybeCallback as StoreCallback);

    // 32 byte 무작위 → URL-safe base64 → 콜백
    const state = crypto.randomBytes(32).toString('base64url');
    const key = `${KEY_PREFIX}${this.providerKey}:${state}`;

    // .then(onFulfilled, onRejected) 2-arg 형태 사용:
    // .then(...).catch(...) 체이닝하면 callback 내부 throw가 .catch로 흘러
    // callback이 두 번 호출되는 버그 발생. 2-arg .then은 onFulfilled의 throw가
    // 다음 onRejected로 넘어가지 않으므로 안전.
    this.redisService.set(key, '1', STATE_TTL_SECONDS).then(
      () => callback(null, state),
      (err: unknown) =>
        callback(err instanceof Error ? err : new Error(String(err))),
    );
  }

  /**
   * 콜백 단계: 클라이언트가 들고 온 state가 우리가 발급한 것과 일치하는지 검증.
   * 한 번 사용된 state는 즉시 폐기(replay 방지).
   *
   * 주의: get → del 사이에 미세한 TOCTOU 윈도우가 있으나 (state는 클라이언트만
   * 알고 짧은 TTL이므로) 실제 공격 가능성은 매우 낮다. 더 엄격한 보장이 필요해지면
   * Redis GETDEL (6.2+) 또는 Lua script로 원자화 가능.
   */
  verify(req: Request, providedState: string, callback: VerifyCallback): void {
    if (!providedState || typeof providedState !== 'string') {
      callback(null, false, { message: 'Missing OAuth state parameter' });
      return;
    }

    const key = `${KEY_PREFIX}${this.providerKey}:${providedState}`;

    // 검증 성공 후 del → 그 이후에 callback. del 결과는 무시
    // (state 검증 자체는 get으로 끝나며, del 실패해도 TTL이 곧 정리함).
    const handle = async (): Promise<{ ok: boolean; reason?: string }> => {
      const value = await this.redisService.get(key);
      if (value === null) {
        return { ok: false, reason: 'Invalid or expired OAuth state' };
      }
      // 일회용 처리: best-effort, 실패해도 TTL이 정리
      await this.redisService.del(key).catch(() => {
        /* del 실패는 무시 (TTL fallback) */
      });
      return { ok: true };
    };

    handle().then(
      (result) => {
        if (result.ok) {
          callback(null, true, providedState);
        } else {
          callback(null, false, { message: result.reason ?? 'Invalid state' });
        }
      },
      (err: unknown) =>
        callback(err instanceof Error ? err : new Error(String(err)), false),
    );
  }
}
