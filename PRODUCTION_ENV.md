# 프로덕션 환경 변수 설정

## 프론트엔드 (Vercel)

Vercel 대시보드에서 설정해야 하는 환경 변수:

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `NEXT_PUBLIC_API_URL` | `https://api.teacherlounge.co.kr/api` | 백엔드 API URL |
| `NEXT_PUBLIC_APP_URL` | `https://teacherlounge.co.kr` | 프론트엔드 URL |
| `AUTH_SECRET` | `<openssl rand -base64 32>` | Auth.js 시크릿 |

## 백엔드 (Naver Cloud / Docker)

Docker 환경에서 설정해야 하는 환경 변수:

### 필수

| 변수명 | 예시 값 | 설명 |
|--------|---------|------|
| `NODE_ENV` | `production` | 환경 (production 필수!) |
| `PORT` | `3000` | 서버 포트 |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | PostgreSQL 연결 |
| `JWT_SECRET` | `<openssl rand -base64 32>` | JWT 서명 시크릿 |
| `JWT_EXPIRES_IN` | `15m` | Access Token 만료 시간 |
| `REFRESH_TOKEN_SECRET` | `<openssl rand -base64 32>` | Refresh Token 시크릿 |
| `REFRESH_TOKEN_EXPIRES_IN` | `7d` | Refresh Token 만료 시간 |
| `ALLOWED_ORIGINS` | `https://teacherlounge.co.kr,https://www.teacherlounge.co.kr` | CORS 허용 도메인 |
| `FRONTEND_URL` | `https://teacherlounge.co.kr` | 프론트엔드 URL (OAuth 리다이렉트용) |

### Redis (Rate Limiting, OAuth 캐시)

| 변수명 | 예시 값 | 설명 |
|--------|---------|------|
| `REDIS_HOST` | `redis` | Redis 호스트 |
| `REDIS_PORT` | `6379` | Redis 포트 |
| `REDIS_PASSWORD` | `<openssl rand -base64 24>` | Redis 비밀번호 |

### 이메일 (SMTP)

| 변수명 | 예시 값 | 설명 |
|--------|---------|------|
| `SMTP_HOST` | `smtp.gmail.com` | SMTP 서버 |
| `SMTP_PORT` | `587` | SMTP 포트 |
| `SMTP_USER` | `your-email@gmail.com` | SMTP 사용자 |
| `SMTP_PASS` | `app-password` | SMTP 비밀번호 |
| `MAIL_FROM` | `noreply@teacherlounge.co.kr` | 발신자 이메일 |
| `MAIL_FROM_NAME` | `교사쉼터` | 발신자 이름 |

### 보안

| 변수명 | 예시 값 | 설명 |
|--------|---------|------|
| `IP_HASH_SALT` | `<openssl rand -hex 16>` | IP 해싱용 솔트 |
| `FILE_ENCRYPTION_KEY` | `<openssl rand -base64 32>` | 인증서류 암호화 키 |

### OAuth (선택)

| 변수명 | 설명 |
|--------|------|
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 시크릿 |
| `GOOGLE_CALLBACK_URL` | `https://api.teacherlounge.co.kr/api/auth/google/callback` |
| `KAKAO_CLIENT_ID` | Kakao OAuth 클라이언트 ID |
| `KAKAO_CLIENT_SECRET` | Kakao OAuth 시크릿 |
| `KAKAO_CALLBACK_URL` | `https://api.teacherlounge.co.kr/api/auth/kakao/callback` |
| `NAVER_CLIENT_ID` | Naver OAuth 클라이언트 ID |
| `NAVER_CLIENT_SECRET` | Naver OAuth 시크릿 |
| `NAVER_CALLBACK_URL` | `https://api.teacherlounge.co.kr/api/auth/naver/callback` |

## 쿠키 설정

프로덕션에서 쿠키는 다음과 같이 설정됩니다:

```
Set-Cookie: refreshToken=xxx;
  HttpOnly;
  Secure;
  SameSite=None;
  Path=/;
  Domain=.teacherlounge.co.kr;
  Max-Age=604800
```

- `SameSite=None`: 크로스 도메인 요청에서 쿠키 전송 허용 (www → api)
- `Domain=.teacherlounge.co.kr`: 서브도메인 간 쿠키 공유
- `Secure`: HTTPS에서만 전송

## 아키텍처

```
[사용자 브라우저]
       │
       ▼
[www.teacherlounge.co.kr] ─── Vercel (프론트엔드)
       │
       │ API 요청 (withCredentials: true)
       │ Cookie: refreshToken (SameSite=None)
       ▼
[api.teacherlounge.co.kr] ─── Naver Cloud (백엔드 + Nginx)
       │
       ▼
[PostgreSQL + Redis]
```
