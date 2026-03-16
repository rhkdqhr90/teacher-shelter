# 배포 가이드

## 🚨 이 문서를 반드시 읽어야 하는 이유

이 서비스는 **실제 교사들이 매일 사용하는 프로덕션 서비스**입니다.

내가 코드를 수정할 때 실수하면:
- 사용자들이 로그인을 못 함
- 사용자들이 쓴 글이 사라짐
- 사이트가 아예 안 열림
- 사용자들이 떠나감

**"개선한다"고 건드렸다가 서비스가 망가지면, 그건 개선이 아니라 파괴다.**

---

## 내가 절대 하면 안 되는 것

### 1. 환경변수를 코드에서 쓰고 docker-compose.yml에 안 넣기

```
❌ 잘못된 예:
configuration.ts에서 process.env.NEW_VAR 사용
→ docker-compose.yml에 NEW_VAR 안 넣음
→ 프로덕션에서 undefined
→ 서비스 터짐
```

**환경변수 추가할 때 반드시 4개 파일 동시 수정:**
1. `backend/src/config/configuration.ts`
2. `docker-compose.yml`
3. `.env.example` (루트)
4. `backend/.env.example`

### 2. docker compose down -v 실행

```bash
docker compose down -v   # ← 이거 치면 끝남
```

이 명령어는 **모든 데이터를 삭제**함:
- PostgreSQL 데이터 (사용자, 게시글 전부)
- SSL 인증서 (사이트 접속 불가)
- 업로드된 파일 전부

### 3. 하드코딩된 값을 환경변수로 바꾸면서 docker-compose.yml 누락

내가 이번에 한 실수:
```typescript
// 원래 코드 (잘 작동함)
domain: '.teacherlounge.co.kr'

// 내가 "개선"한 코드
domain: process.env.COOKIE_DOMAIN  // docker-compose.yml에 안 넣음 → undefined → 로그인 안 됨
```

### 4. 서버 스펙 무시하고 설정 변경

- 서버: **1 CPU / 4GB RAM**
- CPU 제한을 2.0으로 설정하면 → 서버 다운
- Docker 내에서 TypeScript 빌드하면 → 메모리 부족으로 실패

### 5. 테스트 없이 프로덕션 배포

"코드 한 줄 바꿨으니 괜찮겠지" → 안 괜찮음

---

## 서버 구조

```
서버 (1 CPU / 4GB RAM)
├── nginx (80/443) ─── SSL 인증서 (certbot)
├── backend (3000) ─── NestJS API
├── postgres (5432) ── 데이터베이스
└── redis (6379) ───── 캐시

프론트엔드: Vercel (별도)
```

**Volume (절대 삭제 금지):**
- `app_postgres_data`: DB 데이터
- `app_certbot_data`: SSL 인증서
- `app_uploads_data`: 업로드 파일

---

## 배포 방법

### 왜 이렇게 해야 하는가

서버가 1코어라서 Docker 안에서 TypeScript 빌드(`pnpm build`)하면 메모리 부족으로 실패함.
그래서 **로컬에서 미리 빌드한 dist 폴더**를 서버에 올려야 함.

### 배포 순서

```bash
# 1. 로컬에서 빌드
cd backend
pnpm build

# 2. git push
git add .
git commit -m "build: update dist"
git push

# 3. 서버에서 배포
ssh root@서버IP
cd /app
git pull
docker compose up -d --build backend
```

### 서버 네트워크 문제 시 (Docker Hub 타임아웃)

```bash
# 로컬에서 이미지 빌드
cd backend
pnpm build
docker build --platform linux/amd64 -t teacher-shelter-backend:latest .

# 이미지 전송
docker save teacher-shelter-backend:latest | gzip > backend-image.tar.gz
scp backend-image.tar.gz root@서버IP:/app/

# 서버에서 로드
ssh root@서버IP
cd /app
gunzip -c backend-image.tar.gz | docker load
docker compose up -d --force-recreate backend
```

---

## 환경변수 목록

### 프론트엔드 (Vercel)

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `NEXT_PUBLIC_API_URL` | `https://api.teacherlounge.co.kr/api` | 백엔드 API URL |
| `NEXT_PUBLIC_APP_URL` | `https://teacherlounge.co.kr` | 프론트엔드 URL (robots.ts, sitemap.ts) |
| `NEXT_PUBLIC_SITE_URL` | `https://teacherlounge.co.kr` | metadataBase, canonical, JSON-LD, RSS 피드 기준 URL |
| `AUTH_SECRET` | `<openssl rand -base64 32>` | Auth.js 시크릿 |

### 백엔드 (docker-compose.yml)

```yaml
NODE_ENV: production
DATABASE_URL: postgresql://...
JWT_SECRET: ${JWT_SECRET}
REFRESH_TOKEN_SECRET: ${REFRESH_TOKEN_SECRET}
IP_HASH_SALT: ${IP_HASH_SALT}
ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}
SMTP_HOST: ${SMTP_HOST}
SMTP_PORT: ${SMTP_PORT:-587}
SMTP_USER: ${SMTP_USER}
SMTP_PASS: ${SMTP_PASS}
SMTP_FROM: ${SMTP_FROM}
REDIS_HOST: redis
REDIS_PORT: 6379
REDIS_PASSWORD: ${REDIS_PASSWORD}
FILE_ENCRYPTION_KEY: ${FILE_ENCRYPTION_KEY}
FRONTEND_URL: ${FRONTEND_URL:-https://teacherlounge.co.kr}
COOKIE_DOMAIN: ${COOKIE_DOMAIN:-.teacherlounge.co.kr}
ALLOWED_REDIRECT_ORIGINS: ${ALLOWED_REDIRECT_ORIGINS:-https://teacherlounge.co.kr,https://www.teacherlounge.co.kr}
```

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

### 중요한 것들

| 변수 | 값 | 빠지면 |
|------|-----|--------|
| `COOKIE_DOMAIN` | `.teacherlounge.co.kr` | 로그인 안 됨 |
| `ALLOWED_ORIGINS` | `https://teacherlounge.co.kr,...` | API 호출 안 됨 |
| `FRONTEND_URL` | `https://teacherlounge.co.kr` | OAuth 리다이렉트 실패 |

---

## Docker Volume 이름

Docker Compose가 `/app`에서 실행되면 volume 이름에 `app_` prefix가 붙음:

| docker-compose.yml | 실제 이름 |
|-------------------|-----------|
| `postgres_data` | `app_postgres_data` |
| `certbot_data` | `app_certbot_data` |
| `uploads_data` | `app_uploads_data` |

**확인 방법:**
```bash
docker volume ls
```

---

## Dockerfile 구조

```dockerfile
# Stage 1: 의존성만 설치
FROM node:22-alpine AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: 실행 (빌드 없음!)
FROM node:22-alpine AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY dist ./dist          # ← 로컬에서 빌드된 것
COPY prisma ./prisma
RUN npx prisma generate
RUN mkdir -p uploads logs  # ← logs 폴더 필수 (winston)
CMD ["node", "dist/src/main.js"]  # ← 경로 주의
```

**핵심:**
- `RUN pnpm build` 없음 (서버에서 빌드 안 함)
- `dist` 폴더는 로컬에서 미리 빌드해서 git에 포함
- `dist/src/main.js` 경로 (NestJS 기본 출력)
- `logs` 폴더 생성 필수 (winston 로그용)

---

## 트러블슈팅

### 로그인이 계속 풀림

**원인:** `COOKIE_DOMAIN` 환경변수 누락

**확인:**
```bash
# 서버에서
grep COOKIE_DOMAIN docker-compose.yml
# 출력: COOKIE_DOMAIN: ${COOKIE_DOMAIN:-.teacherlounge.co.kr}

grep COOKIE_DOMAIN .env
# 출력: COOKIE_DOMAIN=.teacherlounge.co.kr
```

**브라우저에서 확인:**
개발자도구 → Application → Cookies → refreshToken 도메인이 `.teacherlounge.co.kr`인지 확인

### dist 경로 오류

```
Error: Cannot find module '/app/dist/main.js'
```

**원인:** NestJS는 `dist/src/main.js`로 빌드됨

**확인:**
```bash
ls backend/dist/src/main.js  # 이 파일이 있어야 함
```

**Dockerfile 확인:**
```dockerfile
CMD ["node", "dist/src/main.js"]  # main.js가 아니라 src/main.js
```

### logs 폴더 권한 오류

```
Error: EACCES: permission denied, mkdir 'logs/'
```

**원인:** Dockerfile에서 logs 폴더 생성 안 함

**Dockerfile에 추가:**
```dockerfile
RUN mkdir -p uploads/verification uploads/profiles logs && chown -R nestjs:nodejs uploads logs
```

### Docker Hub 연결 실패

```
TLS handshake timeout
```

**원인:** 서버 네트워크 불안정

**해결:** 로컬에서 이미지 빌드 후 scp로 전송 (위의 "서버 네트워크 문제 시" 참조)

### SSL 인증서 없음

```
nginx: [emerg] cannot load certificate
```

**원인:** certbot volume 연결 안 됨

**확인:**
```bash
docker volume ls | grep cert
# app_certbot_data 있는지 확인

docker run --rm -v app_certbot_data:/etc/letsencrypt alpine ls /etc/letsencrypt/live/
# api.teacherlounge.co.kr 폴더 있는지 확인
```

---

## 내가 이번에 한 실수들 (반복 금지)

1. **COOKIE_DOMAIN**: 코드에서 환경변수로 바꿨는데 docker-compose.yml에 안 넣음 → 로그인 안 됨
2. **CPU 제한**: 2.0으로 설정 → 1코어 서버에서 문제
3. **tsconfig.json rootDir**: 건드려서 dist 경로 꼬임
4. **Dockerfile logs 폴더**: 생성 안 해서 권한 오류
5. **Volume**: docker compose down -v로 인증서 날림

**교훈: "개선"하려고 건드리기 전에 현재 잘 작동하는지 먼저 확인하고, 한 번에 하나씩만 바꾸고, 테스트하고, 배포하기**

---

## 🔴 데이터 보호 (최우선)

### 데이터가 저장된 곳

| 위치 | 내용 | 소실 시 영향 |
|------|------|-------------|
| `app_postgres_data` | 사용자, 게시글, 댓글 전부 | **서비스 종료 수준** |
| `app_uploads_data` | 업로드된 이미지, 파일 | 게시글 이미지 깨짐 |
| `app_certbot_data` | SSL 인증서 | HTTPS 접속 불가 |

### 데이터를 날리는 명령어 (절대 금지)

```bash
# 🔴 절대 실행 금지
docker compose down -v          # 모든 volume 삭제
docker volume rm app_postgres_data  # DB 삭제
docker volume prune             # 사용 안 하는 volume 삭제 (위험)
docker system prune -a --volumes    # 전체 정리 (volume 포함)

# 🟢 안전한 명령어
docker compose down             # volume 유지
docker compose restart          # 재시작만
docker compose up -d --build    # 재빌드 (volume 유지)
```

### DB 백업 (정기적으로 해야 함)

```bash
# 백업 생성
docker exec teacher-shelter-db pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > backup_$(date +%Y%m%d).sql

# 또는 압축해서
docker exec teacher-shelter-db pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} | gzip > backup_$(date +%Y%m%d).sql.gz
```

### DB 복원 (백업이 있을 때만 가능)

```bash
# 복원
cat backup_20250225.sql | docker exec -i teacher-shelter-db psql -U ${POSTGRES_USER} ${POSTGRES_DB}

# 압축된 경우
gunzip -c backup_20250225.sql.gz | docker exec -i teacher-shelter-db psql -U ${POSTGRES_USER} ${POSTGRES_DB}
```

### DB 스키마 변경 시 주의사항

```bash
# 1. 변경 전 반드시 백업
docker exec teacher-shelter-db pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > before_migration.sql

# 2. 마이그레이션 실행
docker exec teacher-shelter-api npx prisma migrate deploy

# 3. 문제 발생 시 복원
cat before_migration.sql | docker exec -i teacher-shelter-db psql -U ${POSTGRES_USER} ${POSTGRES_DB}
```

### 데이터 관련 작업 전 체크리스트

- [ ] 백업 생성했는가?
- [ ] 복원 방법 알고 있는가?
- [ ] 테스트 환경에서 먼저 시도했는가?
- [ ] 롤백 계획 있는가?

**데이터는 한 번 날리면 복구 불가능. 백업 없으면 서비스 끝.**

---

## 배포 전략

### 프론트엔드 vs 백엔드 배포

| 구분 | 프론트엔드 | 백엔드 |
|------|-----------|--------|
| 호스팅 | Vercel | Naver Cloud (Docker) |
| 배포 방법 | git push → 자동 배포 | git pull → docker compose --build |
| 롤백 | Vercel 대시보드에서 이전 버전 선택 | git revert → 재배포 |
| 환경변수 | Vercel 대시보드 | docker-compose.yml + .env |

### 배포 순서 (의존성 고려)

```
1. 백엔드 API 변경이 있는 경우:
   백엔드 먼저 배포 → 프론트엔드 배포

2. 프론트엔드만 변경:
   프론트엔드만 배포 (git push)

3. 둘 다 변경:
   백엔드 먼저 → 프론트엔드 나중에
   (프론트엔드가 없는 API를 호출하면 에러)
```

### 변경 유형별 배포

| 변경 내용 | 프론트엔드 | 백엔드 | 비고 |
|----------|-----------|--------|------|
| UI/스타일 변경 | ✅ | - | git push만 |
| CSP 정책 변경 | ✅ | - | middleware.ts |
| API 엔드포인트 추가 | ✅ | ✅ | 백엔드 먼저 |
| 환경변수 추가 | Vercel 설정 | docker-compose.yml | 양쪽 다 |
| DB 스키마 변경 | - | ✅ | prisma migrate |
| 인증/쿠키 로직 | - | ✅ | 테스트 필수 |

### 배포 전 체크리스트

**프론트엔드 배포 전:**
- [ ] 로컬에서 `pnpm build` 성공하는지 확인
- [ ] 로컬에서 기능 테스트 완료
- [ ] CSP 변경 시 새 도메인 추가했는지 확인
- [ ] 환경변수 추가 시 Vercel 대시보드에 설정

**백엔드 배포 전:**
- [ ] 로컬에서 `pnpm build` 실행 (dist 생성)
- [ ] 환경변수 추가 시 4개 파일 모두 수정했는지 확인
- [ ] DB 스키마 변경 시 마이그레이션 준비
- [ ] 로컬 Docker에서 테스트

### 롤백 계획

**프론트엔드 롤백:**
```
1. Vercel 대시보드 접속
2. Deployments 탭
3. 이전 정상 배포 선택 → Redeploy
```

**백엔드 롤백:**
```bash
# 서버에서
cd /app
git log --oneline -5  # 이전 커밋 확인
git revert HEAD       # 마지막 커밋 취소
# 또는
git reset --hard <이전커밋>  # 강제 롤백 (주의)

# 재빌드
docker compose up -d --build backend
```

### 긴급 상황 대응

**서비스 다운 시:**
```bash
# 1. 로그 확인
docker logs teacher-shelter-api --tail 50

# 2. 컨테이너 상태 확인
docker ps -a

# 3. 재시작 시도
docker compose restart backend

# 4. 그래도 안 되면 이전 버전으로 롤백
```

**로그인 안 될 때:**
```bash
# 1. COOKIE_DOMAIN 확인
docker exec teacher-shelter-api printenv | grep COOKIE

# 2. 브라우저 쿠키 확인
# 개발자도구 → Application → Cookies

# 3. 필요시 환경변수 수정 후 재시작
docker compose up -d backend
```
