# 프로덕션 배포 트러블슈팅 기록

## 인프라 환경

| 항목 | 설정 |
|------|------|
| 프론트엔드 | Vercel (`teacherlounge.co.kr`, `www.teacherlounge.co.kr`) |
| 백엔드 | Naver Cloud (`api.teacherlounge.co.kr`) |
| 서버 스펙 | 1 CPU / 4GB RAM |
| 실행 방식 | Docker Compose (backend, nginx, postgres, redis) |

---

## 문제 1: 서버에서 빌드 실패

### 증상
```bash
docker compose build backend
# 메모리 부족으로 빌드 실패
```

### 원인
- Naver Cloud 서버가 1CPU/4GB RAM으로 리소스가 부족
- NestJS + TypeScript 빌드 시 메모리 사용량이 높음

### 해결
로컬에서 빌드 후 `dist/` 폴더를 포함하여 Docker 이미지 생성

```bash
# 로컬에서
cd backend
pnpm build                    # dist/ 생성
docker build -t backend .     # dist 포함 이미지 빌드

# 서버로 전송
docker save backend | gzip > backend.tar.gz
scp backend.tar.gz user@server:/path/

# 서버에서
docker load < backend.tar.gz
docker compose up -d
```

---

## 문제 2: 로그인은 되는데 홈페이지에서 로그인 상태 유지 안됨

### 증상
1. 로그인 API 호출 → 성공 (200 OK)
2. 홈페이지로 이동 → 로그인 버튼이 다시 표시됨
3. 브라우저 쿠키 확인 → `refreshToken` 쿠키가 **2개** 존재

```
refreshToken (domain: api.teacherlounge.co.kr)  ← 이전 배포에서 생성
refreshToken (domain: .teacherlounge.co.kr)     ← 현재 코드에서 생성
```

### 원인 분석

#### 쿠키 도메인의 동작 원리

```
┌─────────────────────────────────────────────────────────────┐
│                    브라우저 쿠키 저장소                        │
├─────────────────────────────────────────────────────────────┤
│ refreshToken │ api.teacherlounge.co.kr │ (이전 배포)         │
│ refreshToken │ .teacherlounge.co.kr    │ (현재 배포)         │
└─────────────────────────────────────────────────────────────┘
```

**쿠키 domain 설정에 따른 전송 범위:**

| 쿠키 domain | api.teacherlounge.co.kr에서 전송 | teacherlounge.co.kr에서 전송 |
|-------------|--------------------------------|------------------------------|
| `api.teacherlounge.co.kr` | ✅ | ❌ |
| `.teacherlounge.co.kr` | ✅ | ✅ |

#### 문제 발생 과정

```
[1단계: 이전 배포]
- 코드: domain 설정 없음
- 결과: api.teacherlounge.co.kr 도메인으로 쿠키 설정됨
- 동작: api 서버에서만 쿠키 전송됨 → 문제없이 작동

[2단계: 코드 수정]
- 코드: domain: '.teacherlounge.co.kr' 추가
- 의도: 서브도메인 간 쿠키 공유 (www ↔ api)

[3단계: 새 배포 후]
- 기존 쿠키: api.teacherlounge.co.kr (삭제 안됨, 브라우저에 남아있음)
- 새 쿠키: .teacherlounge.co.kr (새로 추가됨)
- 결과: 쿠키 2개 공존!

[4단계: 프론트엔드에서 API 요청]
- 요청 출처: www.teacherlounge.co.kr
- 전송되는 쿠키: .teacherlounge.co.kr 도메인 쿠키만!
- api.teacherlounge.co.kr 쿠키는 전송 안됨 (도메인 불일치)
```

#### 왜 로그인이 안 됐나?

```
www.teacherlounge.co.kr (프론트엔드)
         │
         │ POST /api/auth/refresh
         │ Cookie: refreshToken=xxx (domain: .teacherlounge.co.kr)
         ▼
api.teacherlounge.co.kr (백엔드)
         │
         │ 쿠키 파싱 → 토큰 검증
         │
         │ ⚠️ 문제: 브라우저가 2개 쿠키 중 하나만 전송
         │ 백엔드에서 받은 쿠키와 DB의 토큰 해시가 불일치할 수 있음
         ▼
인증 실패 또는 불안정한 동작
```

### 해결

#### 1. 로그인 시 기존 쿠키 삭제

```typescript
// auth.controller.ts
private setRefreshTokenCookie(res: Response, refreshToken: string) {
  const isProduction = process.env.NODE_ENV === 'production';

  // 프로덕션: 이전 배포에서 생성된 쿠키 삭제
  if (isProduction) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      // domain 없이 → api.teacherlounge.co.kr 쿠키 삭제
    });
  }

  // 새 쿠키 설정
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    domain: isProduction ? '.teacherlounge.co.kr' : undefined,
  });
}
```

#### 2. 로그아웃 시 양쪽 쿠키 모두 삭제

```typescript
// logout 메서드
if (isProduction) {
  // 1. domain 없는 쿠키 삭제
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });
  // 2. domain 있는 쿠키 삭제
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    domain: '.teacherlounge.co.kr',
  });
}
```

---

## 문제 3: CORS 헤더 중복

### 증상
```
Access-Control-Allow-Origin header contains multiple values
'https://www.teacherlounge.co.kr, https://www.teacherlounge.co.kr'
```

### 원인
Nginx와 NestJS **양쪽에서** CORS 헤더를 추가하고 있었음

```
[요청 흐름]

브라우저 → Nginx → NestJS → 응답
              │        │
              │        └─ Access-Control-Allow-Origin: xxx (NestJS)
              │
              └─ Access-Control-Allow-Origin: xxx (Nginx 추가)

결과: 헤더가 2번 추가됨 → 브라우저 거부
```

### 해결
Nginx에서 CORS 설정 제거, NestJS에서만 처리

```nginx
# nginx.conf.template (수정 전)
location / {
    add_header 'Access-Control-Allow-Origin' $cors_origin always;  # 삭제
    add_header 'Access-Control-Allow-Credentials' 'true' always;   # 삭제
    proxy_pass http://backend;
}

# nginx.conf.template (수정 후)
location / {
    # CORS는 NestJS에서 처리
    proxy_pass http://backend;
}
```

```typescript
// main.ts (NestJS)
app.enableCors({
  origin: configService.get('cors.origins'),  // 환경변수에서 허용 도메인 설정
  credentials: true,
});
```

---

## 핵심 교훈

### 1. 쿠키 domain 변경 시 주의
- 기존 쿠키는 **자동으로 삭제되지 않음**
- domain이 다르면 별개의 쿠키로 취급됨
- 마이그레이션 시 기존 쿠키 명시적 삭제 필요

### 2. CORS는 한 곳에서만 설정
- Nginx OR NestJS 중 하나에서만 설정
- 둘 다 설정하면 헤더 중복으로 에러

### 3. 크로스 도메인 쿠키 설정
```typescript
// 프로덕션 크로스 도메인 쿠키 필수 설정
{
  httpOnly: true,           // XSS 방어
  secure: true,             // HTTPS only
  sameSite: 'none',         // 크로스 도메인 허용
  domain: '.example.com',   // 서브도메인 간 공유
}
```

### 4. 서버 리소스 제약 시 빌드 전략
- 메모리 부족 서버에서는 로컬 빌드 후 이미지 전송
- `dist/` 폴더를 Docker 이미지에 포함

---

## 참고: 쿠키 도메인 규칙

| 설정 | 의미 |
|------|------|
| domain 미설정 | 현재 호스트에서만 유효 (api.example.com) |
| domain: '.example.com' | 모든 서브도메인에서 유효 (*.example.com) |
| domain: 'api.example.com' | api.example.com에서만 유효 |

**SameSite 속성:**

| 값 | 동작 |
|---|------|
| `strict` | 같은 사이트에서만 쿠키 전송 |
| `lax` | 일부 크로스 사이트 요청 허용 (기본값) |
| `none` | 모든 크로스 사이트 요청 허용 (Secure 필수) |
