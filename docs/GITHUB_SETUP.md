# GitHub 저장소 설정 가이드

## 현재 상태

```
teacher-shelter/
├── .git (없음)
├── frontend/.git  → nextJs_boilflate (별도 리포)
└── backend/.git   → NestJs_boilerplate (별도 리포)
```

## 목표: 모노레포 통합

```
teacher-shelter/
├── .git  → teacher-shelter (통합 리포)
├── frontend/  (서브폴더)
└── backend/   (서브폴더)
```

---

## 설정 단계

### 1. 새 GitHub 리포지토리 생성

1. GitHub에서 새 리포지토리 생성
   - Name: `teacher-shelter` (또는 `teacherlounge`)
   - Private 선택
   - README, .gitignore 추가하지 않음

### 2. 하위 .git 폴더 제거

```bash
cd ~/Documents/teacher-shelter

# 하위 git 폴더 삭제
rm -rf frontend/.git
rm -rf backend/.git
```

### 3. 루트에서 Git 초기화

```bash
# Git 초기화
git init

# .gitignore 확인 (이미 있으면 스킵)
cat > .gitignore << 'EOF'
# Dependencies
node_modules/

# Build
dist/
.next/
.turbo/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Test
coverage/

# Docker
*.tar
EOF
```

### 4. 원격 저장소 연결 및 Push

```bash
# 원격 저장소 추가
git remote add origin https://github.com/<username>/teacher-shelter.git

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: Teacher Shelter monorepo

- Frontend: Next.js 15 (App Router)
- Backend: NestJS with Prisma
- Docker Compose for production
- Vercel + Oracle Cloud deployment"

# main 브랜치로 push
git branch -M main
git push -u origin main
```

---

## Vercel 연동

### 1. Vercel 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. "Add New Project"
3. GitHub 리포지토리 `teacher-shelter` 선택
4. **Root Directory**: `frontend` 입력
5. Framework: Next.js (자동 감지)

### 2. 환경변수 설정

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.teacherlounge.co.kr` |
| `NEXT_PUBLIC_APP_URL` | `https://teacherlounge.co.kr` |
| `AUTH_SECRET` | `openssl rand -base64 32` 결과 |

### 3. 도메인 연결

Settings → Domains → `teacherlounge.co.kr` 추가

---

## GitHub Actions 설정

### 1. Repository Secrets 추가

Settings → Secrets and variables → Actions → New repository secret

| Name | Value | 설명 |
|------|-------|------|
| `SERVER_HOST` | `xxx.xxx.xxx.xxx` | Oracle VM IP |
| `SERVER_USER` | `ubuntu` | SSH 사용자 |
| `SERVER_SSH_KEY` | `-----BEGIN...` | SSH 개인키 전체 |
| `SERVER_PORT` | `22` | SSH 포트 |

### 2. Environment 생성

Settings → Environments → New environment
- Name: `production`
- (선택) Protection rules 추가

---

## 브랜치 전략

### main 브랜치
- 프로덕션 배포 트리거
- 직접 push 금지 권장

### feature 브랜치
```bash
# 새 기능 개발
git checkout -b feature/add-dark-mode
git commit -m "feat: Add dark mode toggle"
git push origin feature/add-dark-mode

# PR 생성 → 리뷰 → main에 머지
```

### 커밋 메시지 규칙
```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 스타일 변경 (기능 변경 없음)
refactor: 리팩토링
test: 테스트 추가/수정
chore: 빌드, 설정 변경
```

---

## 자동 배포 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                     git push origin main                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
    ┌─────────────────┐               ┌─────────────────┐
    │ frontend/** 변경 │               │ backend/** 변경  │
    └────────┬────────┘               └────────┬────────┘
             │                                 │
             ▼                                 ▼
    ┌─────────────────┐               ┌─────────────────┐
    │     Vercel      │               │ GitHub Actions  │
    │   자동 배포      │               │   워크플로우     │
    └────────┬────────┘               └────────┬────────┘
             │                                 │
             ▼                                 ▼
    ┌─────────────────┐               ┌─────────────────┐
    │ teacherlounge   │               │ api.teacher     │
    │    .co.kr       │               │  lounge.co.kr   │
    └─────────────────┘               └─────────────────┘
```

---

## 빠른 시작 명령어

```bash
# 1. 하위 git 제거 & 모노레포 초기화
cd ~/Documents/teacher-shelter
rm -rf frontend/.git backend/.git
git init
git remote add origin https://github.com/<username>/teacher-shelter.git

# 2. 첫 커밋 & push
git add .
git commit -m "Initial commit: Teacher Shelter monorepo"
git branch -M main
git push -u origin main

# 3. 이후 일상 작업
git add .
git commit -m "feat: 새 기능"
git push
```

---

## 주의사항

1. **기존 boilerplate 리포는 유지해도 됨** - 나중에 다른 프로젝트에서 재사용 가능
2. **push 전 .env 확인** - 비밀 정보가 포함되지 않았는지 확인
3. **큰 파일 주의** - `node_modules`, `uploads/` 등이 .gitignore에 있는지 확인
