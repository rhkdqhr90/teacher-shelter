# Teacher Shelter CI/CD 아키텍처

## 프로덕션 인프라 구성

```
                                    ┌─────────────────────────────────────┐
                                    │           GitHub Repository          │
                                    │       (teacher-shelter monorepo)     │
                                    └──────────────┬──────────────────────┘
                                                   │
                              ┌────────────────────┴────────────────────┐
                              │                                         │
                              ▼                                         ▼
                    ┌─────────────────┐                      ┌─────────────────┐
                    │  frontend/**    │                      │  backend/**     │
                    │  변경 감지       │                      │  변경 감지       │
                    └────────┬────────┘                      └────────┬────────┘
                             │                                        │
                             ▼                                        ▼
                    ┌─────────────────┐                      ┌─────────────────┐
                    │     Vercel      │                      │ GitHub Actions  │
                    │   자동 배포      │                      │   워크플로우     │
                    └────────┬────────┘                      └────────┬────────┘
                             │                                        │
                             │                                        ▼
                             │                               ┌─────────────────┐
                             │                               │      GHCR       │
                             │                               │ (Container Registry)
                             │                               └────────┬────────┘
                             │                                        │
                             ▼                                        ▼
┌────────────────────────────────────────┐     ┌────────────────────────────────────────┐
│              Vercel Edge               │     │           Oracle Cloud VM              │
│                                        │     │          (ARM Free Tier)               │
│  ┌──────────────────────────────────┐  │     │  ┌──────────────────────────────────┐  │
│  │         Next.js SSR              │  │     │  │            Nginx                 │  │
│  │      (자동 최적화, CDN)           │  │────▶│  │     (SSL, Reverse Proxy)         │  │
│  └──────────────────────────────────┘  │     │  └──────────────┬───────────────────┘  │
│                                        │     │                 │                      │
│  • 자동 HTTPS                          │     │                 ▼                      │
│  • 글로벌 CDN (icn1 - 서울)             │     │  ┌──────────────────────────────────┐  │
│  • Preview 배포 (PR마다)                │     │  │         NestJS API               │  │
│  • 롤백 즉시 가능                       │     │  │       (Docker Container)         │  │
└────────────────────────────────────────┘     │  └──────────────┬───────────────────┘  │
                                               │                 │                      │
         teacherlounge.co.kr                   │       ┌─────────┴─────────┐            │
                                               │       ▼                   ▼            │
                                               │  ┌─────────┐       ┌───────────┐      │
                                               │  │PostgreSQL│       │   Redis   │      │
                                               │  │  :5432   │       │   :6379   │      │
                                               │  └─────────┘       └───────────┘      │
                                               └────────────────────────────────────────┘
                                                      api.teacherlounge.co.kr
```

---

## 배포 플로우

### Frontend (Vercel) - 자동

```
개발자 Push → GitHub → Vercel 자동 감지 → 빌드 → 배포 (약 1-2분)
```

| 단계 | 설명 |
|------|------|
| 1. Push | `main` 브랜치에 `frontend/**` 변경 push |
| 2. 감지 | Vercel이 GitHub webhook으로 자동 감지 |
| 3. 빌드 | `pnpm install` → `pnpm build` |
| 4. 배포 | 글로벌 CDN에 자동 배포 |
| 5. 완료 | SSL 자동, 이전 버전 즉시 롤백 가능 |

### Backend (Oracle VM) - GitHub Actions

```
개발자 Push → GitHub Actions → Docker 빌드 → GHCR 푸시 → SSH 배포 (약 5-7분)
```

| 단계 | 설명 |
|------|------|
| 1. Push | `main` 브랜치에 `backend/**` 변경 push |
| 2. Test | Lint, Type Check 실행 |
| 3. Build | Docker 이미지 빌드 (ARM64) |
| 4. Push | GitHub Container Registry에 푸시 |
| 5. Deploy | SSH로 서버 접속 → docker pull → 재시작 |
| 6. Migrate | Prisma 마이그레이션 실행 |
| 7. Health | 헬스체크 확인 |

---

## 상세 워크플로우

### 1. Frontend 배포 (Vercel)

```yaml
# Vercel이 자동으로 처리 (설정 불필요)

트리거: main 브랜치 push (frontend/** 변경)
환경변수: Vercel Dashboard에서 설정
  - NEXT_PUBLIC_API_URL=https://api.teacherlounge.co.kr
  - NEXT_PUBLIC_APP_URL=https://teacherlounge.co.kr
```

**Vercel 장점:**
- Zero-config: 설정 없이 자동 배포
- Preview: PR마다 고유 URL 생성
- Rollback: 클릭 한 번으로 이전 버전 복원
- Analytics: 성능 모니터링 내장

### 2. Backend 배포 (GitHub Actions)

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  test:
    # Lint, Type Check

  build:
    # Docker 이미지 빌드 (ARM64)
    # GHCR에 푸시

  deploy:
    # SSH로 서버 접속
    # docker compose pull
    # docker compose up -d
    # prisma migrate deploy
```

---

## 환경별 설정

### Development (로컬)

```bash
# Frontend
cd frontend && pnpm dev

# Backend
cd backend && pnpm start:dev

# 전체 (Docker)
docker-compose -f docker-compose.dev.yml up
```

### Production

| 구분 | Frontend | Backend |
|------|----------|---------|
| 호스팅 | Vercel | Oracle Cloud VM |
| 도메인 | teacherlounge.co.kr | api.teacherlounge.co.kr |
| SSL | 자동 (Vercel) | Let's Encrypt |
| 배포 | 자동 (GitHub 연동) | GitHub Actions |
| 롤백 | Vercel Dashboard | 이전 이미지 태그 |

---

## 모니터링

### Frontend
- Vercel Analytics (자동)
- Vercel Speed Insights

### Backend
```bash
# 로그 확인
docker compose logs -f backend

# 리소스 사용량
docker stats

# 헬스체크
curl https://api.teacherlounge.co.kr/health
```

---

## 롤백 전략

### Frontend (Vercel)
1. Vercel Dashboard → Deployments
2. 이전 배포 선택 → "Promote to Production"
3. 즉시 적용 (수 초)

### Backend
```bash
# 이전 이미지로 롤백
docker compose pull backend  # 특정 태그 지정 필요시 .env 수정
docker compose up -d --no-deps backend

# 또는 git revert 후 재배포
git revert HEAD
git push origin main
```

---

## 비용

| 서비스 | 비용 | 비고 |
|--------|------|------|
| Vercel | 무료 | Hobby 플랜 (개인 프로젝트) |
| Oracle Cloud | 무료 | Free Tier (ARM 4 OCPU, 24GB RAM) |
| 도메인 | ~15,000원/년 | .co.kr |
| **총합** | **~15,000원/년** | |

---

## 장점 요약

| 항목 | 이전 (Self-hosted 전체) | 현재 (Vercel + Oracle) |
|------|------------------------|------------------------|
| Frontend 배포 | 수동 Docker 빌드 | 자동 (Push만 하면 됨) |
| CDN | 없음 | 글로벌 CDN (서울 포함) |
| SSL | Let's Encrypt 수동 | 자동 |
| Preview | 없음 | PR마다 자동 생성 |
| VM 리소스 | Frontend + Backend | Backend만 (여유로움) |
| 롤백 | Docker 태그 관리 | 클릭 한 번 |

---

## 배포 체크리스트

### 최초 설정

- [ ] 도메인 DNS 설정
  - [ ] `teacherlounge.co.kr` → Vercel
  - [ ] `api.teacherlounge.co.kr` → Oracle VM IP
- [ ] Vercel 프로젝트 생성 및 GitHub 연동
- [ ] Vercel 환경변수 설정
- [ ] Oracle VM 인스턴스 생성
- [ ] Oracle VM 초기 설정 (`scripts/server-setup.sh`)
- [ ] SSL 인증서 발급 (`scripts/ssl-init.sh`)
- [ ] GitHub Secrets 설정
- [ ] 첫 배포 테스트

### 일상 배포

```bash
# 코드 수정 후
git add .
git commit -m "feat: 새 기능"
git push origin main

# 끝! 자동으로 배포됨
```
