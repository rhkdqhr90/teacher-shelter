# 교사쉼터 - 페이즈 1 완료 요약

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 이름 | 교사쉼터 |
| 대상 | 특수교사, 보육교사 |
| 컨셉 | 익명 고민 공유 + 정보 교류 커뮤니티 |
| 색상 | 틸 (#26A69A) - 맑음, 안정, 신뢰 |

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | NestJS 11, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Auth | Custom JWT (Access: 메모리, Refresh: httpOnly Cookie) |
| State | Zustand, React Query |

---

## 완료된 기능 (페이즈 1)

### 1. 인증 시스템
- [x] 회원가입 + 6자리 이메일 인증 (필수)
- [x] 로그인/로그아웃 (Dual Token)
- [x] 토큰 자동 갱신 (Token Rotation)
- [x] 비밀번호 찾기/재설정
- [x] Rate Limiting (브루트포스 방어)

### 2. 게시글/댓글
- [x] 게시글 CRUD (5개 카테고리)
- [x] 댓글/대댓글 + 멘션
- [x] 좋아요 토글
- [x] 조회수 (IP 해싱, 중복 방지)
- [x] 인기글 API (좋아요 3+, 최근 7일)
- [x] 검색 (제목+내용+작성자)

### 3. 사용자/알림
- [x] 프로필 조회/수정
- [x] 프로필 이미지 업로드 (매직넘버 검증)
- [x] 알림 (댓글, 대댓글, 멘션, 좋아요)
- [x] 회원 탈퇴

### 4. 보안
- [x] httpOnly Cookie + SameSite=Strict
- [x] CSRF 미들웨어
- [x] Path Traversal 방어
- [x] Timing Attack 방어
- [x] Winston 로깅

### 5. UI/UX (페이즈 1 마무리)
- [x] 틸 컬러 팔레트 적용
- [x] 홈페이지 대시보드 개편 (인기글 + 카테고리 미리보기)
- [x] 게시판 페이지네이션 적용

---

## 디렉토리 구조

```
teacher-shelter/
├── frontend/
│   └── src/
│       ├── app/                 # App Router 페이지
│       ├── components/          # 공용 컴포넌트 (layout, ui)
│       ├── features/            # 기능별 모듈
│       │   ├── auth/            # 인증 (login, register)
│       │   ├── posts/           # 게시글/댓글
│       │   ├── profile/         # 프로필
│       │   └── notifications/   # 알림
│       ├── lib/                 # API 클라이언트
│       ├── stores/              # Zustand 스토어
│       └── styles/              # globals.css
├── backend/
│   └── src/
│       ├── auth/                # 인증 모듈
│       ├── users/               # 사용자 모듈
│       ├── posts/               # 게시글 모듈
│       ├── comments/            # 댓글 모듈
│       ├── notifications/       # 알림 모듈
│       ├── uploads/             # 파일 업로드
│       ├── mail/                # 이메일 발송
│       └── common/              # 공용 (가드, 필터, 유틸)
└── docs/                        # 문서
```

---

## 주요 파일 (페이즈 2 작업 시 참조)

### Frontend
| 파일 | 역할 |
|------|------|
| `lib/api-client.ts` | Axios 인스턴스, 토큰 갱신 인터셉터 |
| `lib/auth-api.ts` | 인증 API 함수 |
| `stores/auth-store.ts` | 인증 상태 (Zustand) |
| `features/posts/hooks/use-posts.ts` | 게시글 React Query 훅 |
| `features/posts/components/home-dashboard.tsx` | 홈 대시보드 |
| `features/posts/components/board-list.tsx` | 게시판 (페이지네이션) |
| `styles/globals.css` | 전역 CSS + 컬러 변수 |

### Backend
| 파일 | 역할 |
|------|------|
| `auth/auth.service.ts` | 인증 로직, 토큰 관리, 이메일 인증 |
| `posts/posts.service.ts` | 게시글 CRUD, 인기글 |
| `common/middleware/csrf.middleware.ts` | CSRF 검증 |
| `common/utils/ip.util.ts` | IP 해싱 |
| `common/utils/view-tracker.util.ts` | 조회수 중복 방지 |
| `prisma/schema.prisma` | DB 스키마 |

---

## 카테고리

| 카테고리 | 용도 | 특징 |
|---------|------|------|
| FREE | 자유게시판 | 일상 대화 |
| ANONYMOUS | 익명고민 | 자동 익명 처리 |
| KNOWHOW | 노하우 | 경험/팁 공유 |
| INFO | 정보공유 | 연수/정책/자료 |
| LEGAL_QNA | 법률Q&A | 교권/법률 질문 |

---

## API 엔드포인트 요약

### 인증 (`/auth`)
| Method | Path | 설명 |
|--------|------|------|
| POST | /register | 회원가입 |
| POST | /login | 로그인 |
| POST | /logout | 로그아웃 |
| POST | /refresh | 토큰 갱신 |
| POST | /verify-email | 이메일 인증 |
| POST | /resend-verification | 재발송 |
| POST | /forgot-password | 비밀번호 찾기 |
| POST | /reset-password | 비밀번호 재설정 |

### 게시글 (`/posts`)
| Method | Path | 설명 |
|--------|------|------|
| GET | / | 목록 (페이지네이션, 필터) |
| GET | /popular | 인기글 |
| GET | /:id | 상세 |
| POST | / | 작성 |
| PATCH | /:id | 수정 |
| DELETE | /:id | 삭제 |
| POST | /:id/like | 좋아요 토글 |

### 댓글 (`/posts/:postId/comments`)
| Method | Path | 설명 |
|--------|------|------|
| GET | / | 목록 |
| POST | / | 작성 |
| PATCH | /:id | 수정 |
| DELETE | /:id | 삭제 |

### 알림 (`/notifications`)
| Method | Path | 설명 |
|--------|------|------|
| GET | / | 목록 |
| GET | /unread-count | 읽지 않은 수 |
| PATCH | /:id/read | 읽음 처리 |
| PATCH | /read-all | 전체 읽음 |

---

## 컬러 팔레트

```css
/* Primary: 틸 */
--primary: #26A69A;
--primary-light: #E0F7F4;
--primary-dark: #1E8A80;

/* Secondary: 코랄 (액센트) */
--secondary: #FF8A65;

/* Accent: 앰버 (강조) */
--accent: #F59E0B;

/* Background */
--background: #FAFEFE;
--background-subtle: #F5FAFA;
```

---

## 환경변수

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=xxx
REFRESH_TOKEN_SECRET=xxx
IP_HASH_SALT=xxx
ALLOWED_ORIGINS=http://localhost:3001
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASS=xxx
FRONTEND_URL=http://localhost:3001
THROTTLE_LIMIT=100  # 개발: 100, 프로덕션: 10
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## 목 데이터

```bash
# 목 데이터 생성 (10유저, 100게시글, 댓글, 좋아요)
cd backend && npx ts-node prisma/seed-mock.ts
```

테스트 계정: `mock1@test.com` ~ `mock10@test.com` (비밀번호: `Test1234!`)

---

## 장기 과제 (Backlog)

| 과제 | 상태 | 우선순위 |
|------|------|---------|
| 고아 파일 정리 (업로드) | 미구현 | 중 |
| 이미지 최적화 (sharp) | 미구현 | 중 |
| 게시글 삭제 시 이미지 삭제 | 미구현 | 중 |
| CDN 도입 | 미구현 | 낮음 |
| 프로필 이미지 캐싱 | 부분 | 낮음 |

---

## 페이즈 2 예정 기능

1. **OAuth2 연동** (구글, 카카오)
2. **관리자 기능** (사용자/게시글 관리)
3. **신고 시스템**
4. **북마크/스크랩**
5. **이미지 최적화**
6. **PWA / 푸시 알림**

---

## 관련 문서

| 문서 | 내용 |
|------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 전체 아키텍처 |
| [AUTHENTICATION.md](./AUTHENTICATION.md) | 인증 시스템 상세 |
| [SECURITY.md](./SECURITY.md) | 보안 메커니즘 |
| [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) | 알려진 이슈, 백로그 |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 배포 가이드 |

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2025-02-15 | 페이즈 1 완료 |
| 2025-02-15 | 홈 대시보드 개편, 페이지네이션 적용 |
| 2025-02-15 | 틸 컬러 팔레트 적용 |
| 2025-02-15 | 이메일 인증 6자리 코드 방식 |
| 2025-02-15 | 보안 강화 (CSRF, 파일검증, IP해싱) |
