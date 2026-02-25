# 배포 가이드

## 서버 환경
- **서버**: Naver Cloud (1 CPU / 4GB RAM)
- **프론트엔드**: Vercel (teacherlounge.co.kr)
- **백엔드**: Docker (api.teacherlounge.co.kr)

> **중요**: 서버 리소스가 제한적이라 서버에서 직접 빌드하면 메모리 부족으로 실패합니다.
> 반드시 로컬에서 빌드 후 이미지를 서버에 배포해야 합니다.

---

## 배포 방법

### 방법 1: 로컬 빌드 → 이미지 전송 (권장)

```bash
# 1. 로컬에서 빌드
cd backend
docker build --platform linux/amd64 -t teacher-shelter-backend:latest .

# 2. 이미지 저장
docker save teacher-shelter-backend:latest | gzip > backend-image.tar.gz

# 3. 서버로 전송
scp backend-image.tar.gz root@서버IP:/app/

# 4. 서버에서 이미지 로드 및 실행
ssh root@서버IP
cd /app
gunzip -c backend-image.tar.gz | docker load
docker compose up -d --force-recreate backend
```

### 방법 2: 서버에서 로컬 빌드 (메모리 부족 시 실패할 수 있음)

서버의 `docker-compose.yml`에서 backend 섹션 수정:

```yaml
backend:
  # image: ghcr.io/... 주석 처리
  build:
    context: ./backend
    dockerfile: Dockerfile
```

```bash
cd /app
git pull
docker compose up -d --build backend
```

---

## 환경변수 체크리스트

코드에서 환경변수를 추가/변경할 때 **반드시** 아래 파일들을 함께 수정:

| 파일 | 용도 |
|------|------|
| `docker-compose.yml` | 프로덕션 환경변수 (기본값 포함) |
| `.env.example` (루트) | 프로덕션 설정 예시 |
| `backend/.env.example` | 개발 환경 설정 예시 |
| `backend/src/config/configuration.ts` | 환경변수 읽는 코드 |

### 필수 환경변수 (프로덕션)

```bash
# 쿠키 (크로스 도메인 인증 필수!)
COOKIE_DOMAIN=.teacherlounge.co.kr

# CORS
ALLOWED_ORIGINS=https://teacherlounge.co.kr,https://www.teacherlounge.co.kr

# OAuth 리다이렉트
FRONTEND_URL=https://teacherlounge.co.kr
ALLOWED_REDIRECT_ORIGINS=https://teacherlounge.co.kr,https://www.teacherlounge.co.kr
```

---

## 주의사항

### 1. COOKIE_DOMAIN 필수
- 프론트엔드(teacherlounge.co.kr)와 백엔드(api.teacherlounge.co.kr)가 다른 서브도메인
- `COOKIE_DOMAIN=.teacherlounge.co.kr` 설정 필수 (앞에 점 필수)
- 미설정 시 쿠키가 api.teacherlounge.co.kr에만 설정되어 **로그인 유지 실패**

### 2. 코드 변경 시 이미지 재빌드 필요
- `docker-compose.yml` 환경변수만 수정: `docker compose up -d` 로 충분
- TypeScript 코드 수정: **반드시 이미지 재빌드 필요**

### 3. 배포 전 확인사항
- [ ] `backend/dist/` 폴더가 최신 빌드인지 확인 (`pnpm build`)
- [ ] 새로운 환경변수가 `docker-compose.yml`에 추가되었는지 확인
- [ ] 환경변수 기본값이 프로덕션에 적합한지 확인

---

## 트러블슈팅

### 로그인이 계속 풀림
1. `COOKIE_DOMAIN` 환경변수 확인
2. 브라우저 개발자도구 → Application → Cookies에서 refreshToken 도메인 확인
3. `.teacherlounge.co.kr`이 아닌 `api.teacherlounge.co.kr`로 되어 있으면 환경변수 문제

### ghcr.io 이미지 pull 실패
```
Error response from daemon: error from registry: denied
```
- GitHub Container Registry 인증 문제
- 로컬 빌드 → 이미지 전송 방식으로 배포

### 서버 빌드 시 메모리 부족
```
npm ERR! code ENOMEM
```
- 서버(1CPU/4GB)에서 빌드 불가
- 로컬에서 빌드 후 이미지 전송
