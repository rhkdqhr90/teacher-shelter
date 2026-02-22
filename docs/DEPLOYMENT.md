# Teacher Shelter 프로덕션 배포 가이드

## 아키텍처

```
┌─────────────────┐     ┌─────────────────────────────────┐
│     Vercel      │     │       Oracle Cloud VM           │
│  (Frontend)     │     │         (Backend)               │
│                 │     │                                 │
│  Next.js SSR    │────▶│  Nginx ─▶ NestJS API           │
│  자동 CDN       │     │            │                    │
│  자동 HTTPS     │     │     PostgreSQL + Redis          │
└─────────────────┘     └─────────────────────────────────┘
   teacherlounge.co.kr     api.teacherlounge.co.kr
```

- **Frontend (Vercel)**: Next.js 최적화, 자동 배포, CDN, 무료
- **Backend (Oracle VM)**: NestJS + PostgreSQL + Redis, ARM Free Tier

---

## 📋 목차

1. [DNS 설정](#dns-설정)
2. [Vercel 프론트엔드 배포](#vercel-프론트엔드-배포)
3. [Oracle Cloud 백엔드 배포](#oracle-cloud-백엔드-배포)
4. [GitHub Actions 설정](#github-actions-설정)
5. [문제 해결](#문제-해결)

---

## DNS 설정

도메인 등록 업체에서 다음 레코드 추가:

| Type | Name | Value | 용도 |
|------|------|-------|------|
| A | @ | Vercel IP (자동) | 프론트엔드 |
| CNAME | www | cname.vercel-dns.com | 프론트엔드 |
| A | api | <Oracle VM IP> | 백엔드 API |

> Vercel에서 도메인 연결하면 자동으로 설정됩니다.

---

## Vercel 프론트엔드 배포

### 1. Vercel 프로젝트 생성

1. [Vercel](https://vercel.com) 로그인
2. **Add New Project** → GitHub 리포지토리 연결
3. **Root Directory**: `frontend` 선택
4. **Framework Preset**: Next.js (자동 감지)

### 2. 환경 변수 설정

Vercel Dashboard → Settings → Environment Variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.teacherlounge.co.kr` |
| `NEXT_PUBLIC_APP_URL` | `https://teacherlounge.co.kr` |
| `AUTH_SECRET` | `<32자 랜덤 문자열>` |

### 3. 도메인 연결

1. Settings → Domains
2. `teacherlounge.co.kr` 추가
3. `www.teacherlounge.co.kr` 추가 (리다이렉트)

### 4. 자동 배포

- `main` 브랜치 push → 자동 배포
- PR → Preview 배포 생성

---

## Oracle Cloud 백엔드 배포

### 1. VM 인스턴스 생성

1. [Oracle Cloud](https://cloud.oracle.com) → Compute → Instances
2. **Create Instance**:
   - Image: Ubuntu 22.04
   - Shape: VM.Standard.A1.Flex (ARM)
   - OCPUs: 2, Memory: 12GB
   - SSH Key 추가

3. **Security List** (방화벽):
   - Port 80 (HTTP)
   - Port 443 (HTTPS)

### 2. 서버 초기 설정

```bash
# SSH 접속
ssh -i your-key.pem ubuntu@<VM_IP>

# 초기 설정 스크립트 실행
curl -fsSL https://raw.githubusercontent.com/<repo>/main/scripts/server-setup.sh | bash

# 재접속 (docker 그룹 적용)
exit && ssh -i your-key.pem ubuntu@<VM_IP>
```

### 3. 프로젝트 설정

```bash
# 클론
git clone https://github.com/<username>/teacher-shelter.git ~/teacher-shelter
cd ~/teacher-shelter

# 환경변수 설정
cp .env.example .env
nano .env
```

### 4. SSL 인증서 발급

```bash
# SSL 초기 설정 스크립트
./scripts/ssl-init.sh
```

또는 수동으로:

```bash
# 초기 nginx (HTTP만)
cp nginx/nginx-init.conf nginx/nginx.conf.template
docker compose up -d nginx

# 인증서 발급
docker compose run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  -d api.teacherlounge.co.kr \
  --email your@email.com --agree-tos --no-eff-email

# 전체 nginx 설정 복원
git checkout nginx/nginx.conf.template
docker compose restart nginx
```

### 5. 서비스 시작

```bash
# 서비스 시작
docker compose up -d

# DB 마이그레이션
docker compose exec backend npx prisma migrate deploy

# 상태 확인
docker compose ps
curl https://api.teacherlounge.co.kr/health
```

---

## GitHub Actions 설정

### 1. Repository Secrets

GitHub → Settings → Secrets and variables → Actions:

| Secret | 값 |
|--------|-----|
| `SERVER_HOST` | Oracle VM IP |
| `SERVER_USER` | `ubuntu` |
| `SERVER_SSH_KEY` | SSH 개인키 내용 |
| `SERVER_PORT` | `22` |

### 2. Environment 생성

1. Settings → Environments → New environment
2. Name: `production`

### 3. 자동 배포

- `backend/**` 변경 시 자동 배포
- GitHub Actions에서 Docker 이미지 빌드 → GHCR 푸시 → SSH 배포

---

## 문제 해결

### 로그 확인

```bash
# 모든 서비스
docker compose logs -f

# 특정 서비스
docker compose logs -f backend
docker compose logs -f nginx
```

### 서비스 재시작

```bash
docker compose restart backend
docker compose restart nginx
```

### SSL 인증서 갱신

자동 갱신 (certbot 컨테이너)이 설정되어 있음.

수동 갱신:
```bash
docker compose run --rm certbot renew
docker compose restart nginx
```

### DB 백업

```bash
docker compose exec postgres pg_dump -U teacher_shelter teacher_shelter > backup.sql
```

### Oracle Cloud iptables

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

---

## 유용한 명령어

```bash
# 서비스 상태
docker compose ps

# 이미지 업데이트
docker compose pull backend
docker compose up -d --no-deps backend

# 디스크 정리
docker system prune -af

# 컨테이너 접속
docker compose exec backend sh
docker compose exec postgres psql -U teacher_shelter
```
