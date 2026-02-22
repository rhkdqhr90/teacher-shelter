# 보안 감사 및 수정 기록

프로젝트에서 발견된 보안 취약점과 적용한 수정 사항을 정리한 문서입니다.
다음 프로젝트에서 동일한 실수를 반복하지 않기 위한 참고 자료로 활용하세요.

---

## 목차

1. [인프라 (Docker)](#1-인프라-docker)
2. [인증/세션 관리](#2-인증세션-관리)
3. [프론트엔드 보안 헤더](#3-프론트엔드-보안-헤더)
4. [프론트엔드 라우트 보호](#4-프론트엔드-라우트-보호)
5. [기타](#5-기타)
6. [체크리스트](#체크리스트)

---

## 1. 인프라 (Docker)

### 1-1. DB/Redis 포트 외부 노출 [Critical]

#### 증상
- 외부에서 `서버IP:5432`로 PostgreSQL에 직접 접근 가능
- 외부에서 `서버IP:6379`로 Redis에 직접 접근 가능

#### 원인
```yaml
# ❌ 잘못된 코드 (docker-compose.yml)
postgres:
  ports:
    - '5432:5432'  # 호스트 네트워크에 노출!
redis:
  ports:
    - '6379:6379'  # 호스트 네트워크에 노출!
```

#### 해결
```yaml
# ✅ 올바른 코드 - ports 대신 expose 사용 또는 아예 제거
postgres:
  # ports 없음 — Docker 내부 네트워크에서만 접근 가능
  networks:
    - db-net

redis:
  # ports 없음
  networks:
    - db-net
```

#### 원칙
> DB, 캐시, 메시지 큐 등 **내부 서비스는 절대 ports로 외부 노출하지 않는다.**
> `expose`는 같은 Docker 네트워크 내에서만 접근 허용. `ports`는 호스트 네트워크에 바인딩.

---

### 1-2. Docker 네트워크 분리 [High]

#### 증상
- 모든 컨테이너가 같은 네트워크에 있어, 프론트엔드에서 DB에 직접 접근 가능

#### 원인
```yaml
# ❌ 잘못된 코드 - 기본 네트워크 하나만 사용
services:
  postgres:
    # 네트워크 미지정 → default 네트워크
  frontend:
    # 같은 default 네트워크 → DB 접근 가능!
```

#### 해결
```yaml
# ✅ 올바른 코드 - 3-tier 네트워크 분리
networks:
  frontend-net:   # nginx ↔ frontend
    driver: bridge
  backend-net:    # nginx ↔ backend
    driver: bridge
  db-net:         # backend ↔ postgres, redis
    driver: bridge

services:
  nginx:
    networks: [frontend-net, backend-net]  # 프론트/백엔드 모두 프록시
  frontend:
    networks: [frontend-net]               # DB 접근 불가
  backend:
    networks: [backend-net, db-net]        # API + DB
  postgres:
    networks: [db-net]                     # 백엔드에서만 접근
  redis:
    networks: [db-net]                     # 백엔드에서만 접근
```

#### 원칙
> **최소 권한 원칙**: 각 서비스는 통신이 필요한 서비스와만 네트워크를 공유한다.

---

### 1-3. 기본 자격증명 Fallback [Critical]

#### 증상
- `.env` 파일 없이도 `postgres`/`password` 등 기본값으로 서비스 시작

#### 원인
```yaml
# ❌ 잘못된 코드
environment:
  POSTGRES_USER: ${POSTGRES_USER:-postgres}       # 기본값 fallback!
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password} # 위험!
```

#### 해결
```yaml
# ✅ 올바른 코드 - fallback 제거
environment:
  POSTGRES_USER: ${POSTGRES_USER}       # .env 없으면 에러로 실패
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

```env
# .env.example - 생성 명령어 명시
JWT_SECRET=<GENERATE: openssl rand -base64 32>
REDIS_PASSWORD=<GENERATE: openssl rand -base64 24>
FILE_ENCRYPTION_KEY=<GENERATE: openssl rand -base64 32>
```

#### 원칙
> 보안 관련 환경변수에는 **절대 기본값 fallback을 사용하지 않는다.**
> `.env.example`에는 실제 사용 가능한 값 대신 **생성 명령어**를 적는다.

---

### 1-4. .dockerignore 미설정 [Critical]

#### 증상
- Docker 이미지에 `.env`, `node_modules`, `.git` 등이 포함됨

#### 해결
```dockerignore
# ✅ backend/.dockerignore
node_modules
.env
.env.*
!.env.example
.git
.gitignore
*.md
coverage
test
dist
.vscode
.idea
logs
uploads
```

#### 원칙
> **모든 서비스에 `.dockerignore` 필수.** 특히 `.env` 파일이 이미지에 포함되면 시크릿이 영구 노출된다.

---

### 1-5. 컨테이너 리소스 제한 및 보안 옵션 [High]

```yaml
# ✅ 모든 서비스에 적용
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
    security_opt:
      - no-new-privileges:true  # 컨테이너 내 권한 상승 방지
```

#### 원칙
> `deploy.resources.limits`로 메모리/CPU를 제한하여 한 서비스의 문제가 전체 서버에 영향 주는 것을 방지한다.
> `no-new-privileges:true`로 컨테이너 내에서 `setuid` 등을 통한 권한 상승을 차단한다.

---

## 2. 인증/세션 관리

### 2-1. 로그아웃 시 검증 없는 JWT에서 userId 추출 [Critical]

#### 증상
- 공격자가 자신의 refreshToken 쿠키를 가진 상태에서 Authorization 헤더에 타인의 userId를 넣은 가짜 JWT를 전송
- 타인의 accessToken이 블랙리스트에 등록되어 강제 로그아웃됨

#### 원인
```typescript
// ❌ 잘못된 코드 (auth.controller.ts)
async logout(@Req() req: Request) {
  const refreshToken = req.cookies?.refreshToken;

  // 서명 검증 없이 JWT payload에서 userId 추출!
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = this.authService.decodeToken(token); // decode만, verify 안 함!
    userId = decoded?.sub; // 공격자가 임의의 sub을 넣을 수 있음
  }

  await this.authService.logout(refreshToken, userId);
}

// auth.service.ts
async logout(refreshToken: string, userId?: string) {
  // refreshToken revoke
  await this.prisma.refreshToken.updateMany({ ... });

  // userId가 외부에서 온 값 → 타인의 토큰을 블랙리스트에 등록 가능!
  if (userId) {
    await this.prisma.tokenBlacklist.create({
      data: { userId, ... },
    });
  }
}
```

#### 해결
```typescript
// ✅ 올바른 코드 (auth.controller.ts)
async logout(@Req() req: Request) {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    // userId는 서비스에서 DB 레코드를 통해 안전하게 추출
    await this.authService.logout(refreshToken);
  }

  res.clearCookie('refreshToken', { ... });
}

// ✅ 올바른 코드 (auth.service.ts)
async logout(refreshToken: string): Promise<void> {
  const tokenHash = this.hashToken(refreshToken);

  // DB에서 refreshToken 조회 → userId를 신뢰할 수 있게 추출
  const storedToken = await this.prisma.refreshToken.findUnique({
    where: { tokenHash },
    select: { userId: true, revokedAt: true },
  });

  if (!storedToken || storedToken.revokedAt) return;

  const userId = storedToken.userId; // DB에서 온 값 → 신뢰 가능

  // 트랜잭션으로 원자적 처리
  await this.prisma.$transaction([
    this.prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    }),
    this.prisma.tokenBlacklist.create({
      data: { userId, expiresAt: accessTokenExpiry, revokedAt: new Date() },
    }),
  ]);
}
```

#### 원칙
> **`jwtService.decode()`는 서명을 검증하지 않는다.** 페이로드가 조작 가능하므로, decode된 값을 보안 결정(블랙리스트, 권한 등)에 사용하면 안 된다.
> 신뢰할 수 있는 userId가 필요하면 **DB 레코드**에서 추출하거나, **`jwtService.verify()`**로 서명 검증 후 사용한다.

---

### 2-2. 이메일 인증 코드 브루트포스 [Critical]

#### 증상
- 6자리 숫자 코드(100만 가지)를 무제한 시도하여 인증 우회 가능

#### 원인
```typescript
// ❌ 잘못된 코드
async verifyEmail(code: string) {
  const token = await this.prisma.emailVerificationToken.findUnique({
    where: { tokenHash: this.hashToken(code) },
  });
  // 시도 횟수 제한 없음!
  if (!token) throw new BadRequestException('잘못된 코드');
}
```

#### 해결
```typescript
// ✅ 올바른 코드
async verifyEmail(userId: string, code: string) {
  // 1. userId 기반 조회 (인증된 사용자만 호출 가능)
  const latestToken = await this.prisma.emailVerificationToken.findFirst({
    where: { userId, verifiedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  // 2. 최대 시도 횟수 확인
  if (latestToken.attempts >= latestToken.maxAttempts) {
    // 코드 무효화 후 재발송 안내
    throw new BadRequestException('시도 횟수 초과. 코드를 다시 요청하세요.');
  }

  // 3. 시도 횟수 증가
  await this.prisma.emailVerificationToken.update({
    where: { id: latestToken.id },
    data: { attempts: { increment: 1 } },
  });

  // 4. 코드 검증
  if (latestToken.tokenHash !== this.hashToken(code)) {
    const remaining = latestToken.maxAttempts - latestToken.attempts - 1;
    throw new BadRequestException(`잘못된 코드 (남은 시도: ${remaining}회)`);
  }
}
```

```prisma
// schema.prisma
model EmailVerificationToken {
  // ...
  attempts    Int @default(0)    // 시도 횟수
  maxAttempts Int @default(5)    // 최대 시도 횟수
}
```

#### 원칙
> **짧은 인증 코드(4~6자리)는 반드시 시도 횟수를 제한한다.**
> 컨트롤러에 `@UseGuards(JwtAuthGuard)`를 적용하여 인증된 사용자만 코드 검증을 호출할 수 있게 한다.
> Rate Limiting과 함께 사용하면 더 효과적이다.

---

### 2-3. OAuth 콜백 에러 메시지 노출 [High]

#### 증상
- OAuth 실패 시 서버 내부 에러 메시지가 URL에 그대로 노출
- 예: `/login/callback?error=ECONNREFUSED%20127.0.0.1%3A5432`

#### 원인
```typescript
// ❌ 잘못된 코드
} catch (error) {
  // 내부 에러 메시지가 URL에 그대로 포함!
  return res.redirect(`/login/callback?error=${encodeURIComponent(error.message)}`);
}
```

#### 해결
```typescript
// ✅ 올바른 코드 (auth.controller.ts)
} catch (error) {
  this.logger.error(`OAuth callback failed: ${error.message}`, 'AuthController');

  // 에러 코드만 전달 (내부 메시지 노출 방지)
  const errorCode = error instanceof ConflictException
    ? 'account_exists'
    : 'login_failed';
  return res.redirect(`/login/callback?error=${errorCode}`);
}

// ✅ 프론트엔드 (login/callback/page.tsx)
const ERROR_MESSAGES: Record<string, string> = {
  account_exists: '이미 다른 방식으로 가입된 이메일입니다.',
  login_failed: '소셜 로그인에 실패했습니다. 다시 시도해주세요.',
};

const message = ERROR_MESSAGES[errorCode] || '로그인에 실패했습니다.';
```

#### 원칙
> **에러 메시지를 클라이언트에 전달할 때는 에러 코드(enum)를 사용한다.**
> 상세 에러는 서버 로그에만 기록하고, 사용자에게는 일반적인 메시지를 보여준다.
> URL 파라미터에 내부 정보(스택 트레이스, DB 에러 등)가 포함되지 않도록 한다.

---

### 2-4. Redis 인증 없음 [High]

#### 증상
- Redis에 비밀번호가 설정되어 있지 않아, 네트워크 내 누구나 접근 가능

#### 해결
```yaml
# ✅ docker-compose.yml
redis:
  command: >
    redis-server
    --requirepass ${REDIS_PASSWORD}
    --maxmemory 256mb
    --maxmemory-policy allkeys-lru
```

```typescript
// ✅ validation.schema.ts
REDIS_PASSWORD: Joi.string().when('NODE_ENV', {
  is: 'production',
  then: Joi.required(),         // 프로덕션에서 필수
  otherwise: Joi.optional().allow(''),
}),
```

---

## 3. 프론트엔드 보안 헤더

### 3-1. CSP unsafe-inline → nonce 기반 [Medium]

#### 증상
- `script-src 'unsafe-inline'`은 XSS 공격 시 악성 인라인 스크립트 실행을 허용

#### 원인
```typescript
// ❌ 잘못된 코드
const csp = [
  "script-src 'self' 'unsafe-inline'",  // 모든 인라인 스크립트 허용!
];
```

#### 해결
```typescript
// ✅ 올바른 코드 (middleware.ts — Edge Runtime 호환)
export function middleware(request: NextRequest) {
  // 요청별 고유 nonce 생성 (Edge Runtime에서는 Buffer가 없으므로 btoa 사용!)
  const nonce = btoa(crypto.randomUUID());

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,  // nonce 기반
    "style-src 'self' 'unsafe-inline'",  // Tailwind CSS 호환성 위해 유지
    // ...
  ].join('; ');

  // Next.js에 nonce 전달 → 자체 인라인 스크립트에 자동 적용
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set('Content-Security-Policy', csp);
  return response;
}

// ✅ layout.tsx — headers() 호출로 동적 렌더링 강제 (nonce 적용 필수 조건)
import { headers } from 'next/headers';

export default async function RootLayout({ children }) {
  // headers() 호출이 동적 렌더링을 트리거 → Next.js가 CSP 헤더에서 nonce를 추출
  const nonce = (await headers()).get('x-nonce') || '';
  // 향후 외부 스크립트 추가 시: <Script nonce={nonce} src="..." />
}
```

#### 원칙
> **`unsafe-inline`보다 nonce 기반 CSP가 항상 더 안전하다.**
> Next.js 미들웨어에서 `x-nonce` 헤더를 설정하면, Next.js가 자체 인라인 스크립트에 자동으로 nonce를 추가한다.
> `'strict-dynamic'`은 nonce가 부여된 스크립트가 동적으로 로드하는 스크립트도 허용한다.
> `style-src`의 `unsafe-inline`은 Tailwind CSS/Next.js 인라인 스타일 때문에 현재로서는 제거하기 어렵다.
> **Edge Runtime에서는 `Buffer`를 사용할 수 없다.** `btoa()`를 사용한다.
> **nonce가 동작하려면 페이지가 동적 렌더링이어야 한다.** `layout.tsx`에서 `headers()`를 호출하면 자동으로 동적 렌더링이 강제된다.

---

### 3-2. 보안 헤더 중복/누락 [High]

#### 증상
- `next.config.ts`와 `middleware.ts`에서 동일한 헤더를 설정하면 충돌 또는 이중 적용

#### 해결
```typescript
// ✅ middleware.ts에서 일원화 관리
response.headers.set('X-Frame-Options', 'DENY');
response.headers.set('X-Content-Type-Options', 'nosniff');
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
response.headers.set('Content-Security-Policy', csp);

// ✅ next.config.ts에서는 보안 헤더 설정하지 않음
// 보안 헤더는 middleware.ts에서 일원화 관리 (중복 방지)
```

#### 원칙
> **보안 헤더는 한 곳에서만 설정한다.** Next.js에서는 `middleware.ts`가 가장 유연하고 권장되는 위치.
> `next.config.ts`의 `headers()`는 정적 패턴만 지원하고, CSP nonce 같은 동적 값을 넣을 수 없다.

---

## 4. 프론트엔드 라우트 보호

### 4-1. 클라이언트 쿠키 기반 Admin 보호 [High]

#### 증상
- `userRole` 쿠키를 브라우저 콘솔에서 `ADMIN`으로 변경하면 admin UI에 접근 가능

#### 원인
```typescript
// ❌ 잘못된 코드 (auth-store.ts)
setAuth: (accessToken, user) => {
  // httpOnly가 아닌 일반 쿠키 → 클라이언트에서 조작 가능!
  document.cookie = `userRole=${user.role}; path=/; max-age=604800; SameSite=Lax`;
};

// ❌ 잘못된 코드 (middleware.ts)
if (pathname.startsWith('/admin')) {
  const userRole = request.cookies.get('userRole');
  if (userRole && userRole.value !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  // userRole 쿠키 없거나 ADMIN이면 통과 → 조작 시 접근 가능!
}
```

#### 해결
```typescript
// ✅ 올바른 코드 - 3중 방어 (쿠키 사용하지 않음)

// Layer 1: middleware.ts — refreshToken 쿠키 존재 여부만 확인
if (pathname.startsWith('/admin')) {
  const refreshToken = request.cookies.get('refreshToken');
  if (!refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  // role 검증은 클라이언트 + 백엔드에서 수행
}

// Layer 2: AdminLayout (클라이언트) — 서버 API 응답 기반 role 확인
const isAdmin = useIsAdmin(); // Zustand store — 로그인 시 GET /users/me에서 가져온 값
if (user && !isAdmin) {
  router.replace('/');
}

// Layer 3: 백엔드 API — 모든 admin 엔드포인트에 가드 적용
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController { }
```

#### 원칙
> **클라이언트가 설정하는 쿠키는 보안 결정에 사용하면 안 된다.**
> `httpOnly`가 아닌 쿠키는 JavaScript로 조작 가능하다.
> Admin 보호는 반드시 **백엔드 API 레벨**에서 수행하고, 프론트엔드는 UI 편의성 목적으로만 사용한다.

---

### 4-2. 보호 라우트 누락 [High]

#### 증상
- `/posts/new`, `/jobs/new`, `/posts/[id]/edit` 등 인증이 필요한 라우트가 보호되지 않음

#### 해결
```typescript
// ✅ 올바른 코드
const protectedRoutes = [
  '/admin',
  '/my',
  '/notifications',
  '/profile',
  '/posts/new',   // 새 글 작성
  '/jobs/new',    // 새 구인 공고
];

// 동적 라우트도 보호
const isDynamicProtectedRoute =
  /^\/posts\/[^/]+\/(edit|applicants)$/.test(pathname);
```

#### 원칙
> 보호 라우트 목록을 작성할 때 **쓰기(Create/Update/Delete) 기능이 있는 모든 페이지**를 포함한다.
> 동적 라우트(`[id]`)도 정규식으로 매칭하여 보호한다.

---

## 5. 기타

### 5-1. Edge Runtime에서 Node.js API 사용 [High]

#### 증상
- Next.js 미들웨어에서 `Buffer.from()` 사용 시 런타임 에러

#### 원인
```typescript
// ❌ 잘못된 코드 — Buffer는 Node.js API이며 Edge Runtime에서 사용 불가
const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
```

#### 해결
```typescript
// ✅ 올바른 코드 — Web API인 btoa() 사용
const nonce = btoa(crypto.randomUUID());
```

#### 원칙
> **Next.js 미들웨어는 Edge Runtime에서 실행된다.**
> `Buffer`, `fs`, `path` 등 Node.js 전용 API는 사용할 수 없다.
> 대체 Web API: `Buffer.from(str).toString('base64')` → `btoa(str)`, `Buffer.from(str, 'base64').toString()` → `atob(str)`

---

### 5-2. CORS 오리진 파싱 시 공백 처리 [Low]

#### 증상
- `.env`에서 `ALLOWED_ORIGINS=http://localhost:3000, http://localhost:3001` (공백 포함) 시 CORS 매칭 실패

#### 원인
```typescript
// ❌ 잘못된 코드
origins: process.env.ALLOWED_ORIGINS?.split(',')
// 결과: ['http://localhost:3000', ' http://localhost:3001']
//                                  ^ 앞에 공백!
```

#### 해결
```typescript
// ✅ 올바른 코드
origins: process.env.ALLOWED_ORIGINS?.split(',')
  .map((o) => o.trim())     // 앞뒤 공백 제거
  .filter(Boolean)           // 빈 문자열 제거
  || ['http://localhost:3000'],
```

#### 원칙
> **환경변수를 `split(',')`으로 파싱할 때는 항상 `.trim()`과 `.filter(Boolean)`을 추가한다.**
> 사용자가 쉼표 뒤에 공백을 넣는 것은 매우 흔한 실수이다.

---

### 5-3. refreshToken 없이 로그아웃 시 accessToken 블랙리스트 누락 [확인 필요]

#### 증상
- refreshToken 쿠키가 만료/삭제된 상태에서 로그아웃 시 accessToken이 블랙리스트에 추가되지 않음
- 최대 15분간 accessToken이 유효한 상태로 남아있음

#### 해결
```typescript
// ✅ 올바른 코드 (auth.controller.ts)
if (refreshToken) {
  await this.authService.logout(refreshToken);
} else {
  // refreshToken이 없어도 유효한 accessToken이 있으면 블랙리스트 추가
  await this.authService.blacklistFromAccessToken(req.headers.authorization);
}

// ✅ 올바른 코드 (auth.service.ts)
async blacklistFromAccessToken(authHeader: string | undefined): Promise<void> {
  if (!authHeader?.startsWith('Bearer ')) return;

  try {
    const token = authHeader.substring(7);
    // verify()로 서명 검증 — decode()와 달리 조작 불가!
    const payload = await this.jwtService.verifyAsync<{ sub: string }>(token, {
      secret: this.configService.getOrThrow<string>('jwt.secret'),
    });

    if (!payload.sub) return;

    await this.prisma.tokenBlacklist.create({
      data: {
        userId: payload.sub,
        expiresAt: this.calculateAccessTokenExpiry(),
        revokedAt: new Date(),
      },
    });
  } catch {
    // 토큰이 이미 만료/무효 — 블랙리스트 불필요
  }
}
```

#### 원칙
> 로그아웃은 모든 활성 토큰을 무효화해야 한다.
> `jwtService.verify()`는 서명 검증을 수행하므로 userId를 신뢰할 수 있다. `decode()`와 혼동하지 않는다.
> 만료된 토큰은 블랙리스트에 추가할 필요 없으므로 `catch`에서 무시한다.

---

### 5-4. 만료 시간 계산 로직 중복 [리팩토링]

#### 증상
- `logout()`, `resetPassword()`, `blacklistFromAccessToken()`에서 동일한 accessToken 만료 시간 계산 로직 반복

#### 해결
```typescript
// ✅ private 헬퍼 메서드로 추출
private calculateAccessTokenExpiry(): Date {
  const expiry = new Date();
  const expiresIn = this.configService.get<string>('jwt.expiresIn') || '15m';
  const match = expiresIn.match(/^(\d+)([mhd])$/);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];
    if (unit === 'm') expiry.setMinutes(expiry.getMinutes() + value);
    else if (unit === 'h') expiry.setHours(expiry.getHours() + value);
    else if (unit === 'd') expiry.setDate(expiry.getDate() + value);
  } else {
    expiry.setMinutes(expiry.getMinutes() + 15);
  }
  return expiry;
}
```

#### 원칙
> **동일한 로직이 3곳 이상에서 반복되면 헬퍼 메서드로 추출한다.**
> 만료 시간 같은 보안 관련 계산이 여러 곳에 흩어져 있으면, 하나만 수정하고 나머지를 깜빡할 위험이 있다.

---

## 체크리스트

### Docker/인프라
- [ ] DB, Redis, 메시지 큐의 `ports` 매핑이 없는가? (내부 통신만 `expose` 사용)
- [ ] Docker 네트워크가 역할별로 분리되어 있는가?
- [ ] 환경변수에 기본값 fallback(`:-default`)이 없는가?
- [ ] `.dockerignore`에 `.env`, `node_modules`, `.git`이 포함되어 있는가?
- [ ] 컨테이너에 `resources.limits`와 `no-new-privileges`가 설정되어 있는가?
- [ ] Redis에 `--requirepass`가 설정되어 있는가?

### 인증/토큰
- [ ] `jwtService.decode()` 결과를 보안 결정에 사용하지 않는가?
- [ ] 짧은 인증 코드(OTP, 이메일 인증)에 시도 횟수 제한이 있는가?
- [ ] 에러 응답에 서버 내부 메시지(스택 트레이스, DB 에러)가 포함되지 않는가?
- [ ] 비밀번호 찾기 등에서 이메일 존재 여부를 노출하지 않는가? (Email Enumeration 방지)
- [ ] refreshToken이 httpOnly + secure + sameSite 쿠키에 저장되는가?

### CSP/보안 헤더
- [ ] `script-src`에 `unsafe-inline` 대신 nonce를 사용하는가?
- [ ] `unsafe-eval`이 제거되어 있는가?
- [ ] `img-src`가 와일드카드(`https:`) 대신 특정 도메인만 허용하는가?
- [ ] 보안 헤더가 한 곳(middleware.ts)에서만 관리되는가?
- [ ] `upgrade-insecure-requests`가 포함되어 있는가?

### 라우트 보호
- [ ] 쓰기/수정/삭제 기능이 있는 모든 페이지가 보호 라우트에 포함되어 있는가?
- [ ] Admin 보호가 백엔드 API 레벨(@Roles 가드)에서 수행되는가?
- [ ] 클라이언트 쿠키를 보안 결정에 사용하지 않는가?

### 환경변수/시크릿
- [ ] `.env.example`에 실제 사용 가능한 값 대신 생성 명령어가 적혀 있는가?
- [ ] 프로덕션 필수 환경변수에 `Joi.required()` 등 검증이 있는가?
- [ ] `FILE_ENCRYPTION_KEY`, `JWT_SECRET` 등 최소 길이 검증이 있는가?
- [ ] 환경변수 `split(',')`에 `.trim().filter(Boolean)`이 포함되어 있는가?

### Edge Runtime (Next.js 미들웨어)
- [ ] `Buffer`, `fs`, `path` 등 Node.js 전용 API를 사용하지 않는가?
- [ ] `layout.tsx`에서 `headers()`를 호출하여 동적 렌더링을 강제하는가?
- [ ] nonce가 `btoa(crypto.randomUUID())`로 생성되는가?

### 로그아웃/세션
- [ ] refreshToken이 없을 때도 accessToken 블랙리스트가 처리되는가?
- [ ] `jwtService.verify()` vs `jwtService.decode()` 구분이 정확한가?
- [ ] 만료 시간 계산 등 중복 로직이 헬퍼 메서드로 추출되어 있는가?
