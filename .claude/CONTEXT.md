# 교사쉼터 - 프로젝트 컨텍스트 (Phase 3용)

> 최종 수정: 2026-02-16 (Phase 2 완료)

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 이름 | 교사쉼터 |
| 대상 | 특수교사, 보육교사, 어린이집/유치원 교사 |
| 컨셉 | 익명 고민 공유 + 정보 교류 커뮤니티 |
| 컬러 | 틸 (#26A69A) - 맑음, 안정, 신뢰 |

---

## 2. 기술 스택

```
Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, Zustand, React Query
Backend:  NestJS 11, TypeScript, Prisma ORM, PostgreSQL
Auth:     Custom JWT (Access: 메모리 15분, Refresh: httpOnly Cookie 7일)
```

---

## 3. 디렉토리 구조

```
teacher-shelter/
├── frontend/src/
│   ├── app/                    # App Router
│   │   ├── admin/              # 관리자 (대시보드, 신고, 사용자, 게시글)
│   │   └── profile/            # 마이페이지 (북마크 포함)
│   ├── components/             # layout/, ui/
│   ├── features/               # auth/, posts/, profile/, notifications/, admin/
│   ├── lib/                    # api-client.ts, auth-api.ts
│   ├── stores/                 # auth-store.ts
│   └── styles/                 # globals.css
├── backend/src/
│   ├── auth/                   # 인증 (JWT, OAuth2, 이메일인증, 비밀번호)
│   │   ├── strategies/         # Google, Kakao, Naver Passport 전략
│   │   ├── guards/             # jwt-auth, roles
│   │   └── decorators/         # @Roles(), @Admin()
│   ├── users/                  # 사용자 CRUD
│   ├── posts/                  # 게시글 CRUD, 인기글, 북마크
│   ├── comments/               # 댓글/대댓글
│   ├── notifications/          # 알림
│   ├── uploads/                # 파일 업로드
│   ├── mail/                   # 이메일 발송
│   ├── reports/                # 신고 모듈
│   ├── admin/                  # 관리자 모듈
│   └── common/                 # 가드, 필터, 유틸
└── docs/                       # 문서
```

---

## 4. 주요 파일 위치

### Frontend
| 파일 | 역할 |
|------|------|
| `lib/api-client.ts` | Axios + 토큰 갱신 인터셉터 |
| `lib/auth-api.ts` | 인증 API (login, register, refresh) |
| `stores/auth-store.ts` | Zustand 인증 상태 |
| `features/posts/hooks/use-posts.ts` | 게시글 React Query 훅 |
| `features/posts/components/home-dashboard.tsx` | 홈 대시보드 |
| `features/posts/components/board-list.tsx` | 게시판 (페이지네이션) |
| `styles/globals.css` | 전역 CSS + 컬러 변수 |

### Backend
| 파일 | 역할 |
|------|------|
| `auth/auth.service.ts` | 인증 로직 (Timing Attack 방지) |
| `auth/auth.controller.ts` | Rate Limiting |
| `posts/posts.service.ts` | 게시글 CRUD, 인기글 |
| `common/middleware/csrf.middleware.ts` | CSRF 검증 |
| `common/utils/ip.util.ts` | IP 해싱 (솔트) |
| `common/utils/view-tracker.util.ts` | 조회수 중복 방지 |
| `prisma/schema.prisma` | DB 스키마 |

---

## 5. 카테고리

| 코드 | 라벨 | 특징 |
|------|------|------|
| FREE | 자유게시판 | 일상 대화 |
| ANONYMOUS | 익명고민 | 자동 익명 |
| KNOWHOW | 노하우 | 경험/팁 공유 |
| INFO | 정보공유 | 연수/정책/자료 |
| LEGAL_QNA | 법률Q&A | 교권/법률 |

---

## 6. API 요약

> **⚠️ Base URL**: `http://localhost:3000/api` (모든 경로 앞에 `/api` 필요)

### 인증 `/auth`
| Method | Path | 설명 |
|--------|------|------|
| POST | /register | 회원가입 + 이메일인증 발송 |
| POST | /login | 로그인 |
| POST | /logout | 로그아웃 |
| POST | /refresh | 토큰 갱신 |
| POST | /verify-email | 6자리 코드 인증 |
| POST | /resend-verification | 재발송 |
| POST | /forgot-password | 비밀번호 찾기 |
| POST | /reset-password | 비밀번호 재설정 |

### 게시글 `/posts`
| Method | Path | 설명 |
|--------|------|------|
| GET | / | 목록 (페이지네이션, 필터) |
| GET | /hot | 인기글 (24시간, 좋아요+조회수 정렬) |
| GET | /:id | 상세 |
| POST | / | 작성 |
| PATCH | /:id | 수정 |
| DELETE | /:id | 삭제 |
| POST | /:id/like | 좋아요 토글 |
| GET | /:id/like | 좋아요 상태 확인 |
| POST | /:id/bookmark | 북마크 토글 |
| GET | /:id/bookmark | 북마크 상태 확인 |

### 댓글
| Method | Path | 설명 |
|--------|------|------|
| GET | /posts/:postId/comments | 목록 |
| POST | /posts/:postId/comments | 작성 |
| PATCH | /comments/:id | 수정 ⚠️ 경로 다름 |
| DELETE | /comments/:id | 삭제 ⚠️ 경로 다름 |

### 알림 `/notifications`
| Method | Path | 설명 |
|--------|------|------|
| GET | / | 목록 |
| GET | /unread-count | 읽지 않은 수 |
| PATCH | /:id/read | 읽음 |
| PATCH | /read-all | 전체 읽음 |

### 사용자 `/users`
| Method | Path | 설명 |
|--------|------|------|
| GET | /me | 내 프로필 |
| PATCH | /me | 프로필 수정 |
| PATCH | /me/password | 비밀번호 변경 |
| GET | /me/posts | 내가 쓴 글 |
| GET | /me/comments | 내가 쓴 댓글 |
| GET | /me/bookmarks | 내 북마크 |
| DELETE | /me | 회원 탈퇴 |

### 신고 `/reports`
| Method | Path | 설명 |
|--------|------|------|
| POST | / | 신고 접수 |

### 관리자 `/admin` (ADMIN 권한 필요)
| Method | Path | 설명 |
|--------|------|------|
| GET | /stats | 대시보드 통계 |
| GET | /reports | 신고 목록 |
| GET | /reports/:id | 신고 상세 |
| PATCH | /reports/:id | 신고 처리 |
| GET | /users | 사용자 목록 |
| PATCH | /users/:id/role | 사용자 권한 변경 |
| DELETE | /users/:id | 사용자 삭제 |
| GET | /posts | 게시글 목록 |
| DELETE | /posts/:id | 게시글 삭제 |
| DELETE | /comments/:id | 댓글 삭제 |

### OAuth2 `/auth`
| Method | Path | 설명 |
|--------|------|------|
| GET | /google | Google 로그인 리다이렉트 |
| GET | /google/callback | Google 콜백 |
| GET | /kakao | Kakao 로그인 리다이렉트 |
| GET | /kakao/callback | Kakao 콜백 |
| GET | /naver | Naver 로그인 리다이렉트 |
| GET | /naver/callback | Naver 콜백 |

---

## 7. 컬러 팔레트

```css
/* Primary: 틸 */
--primary: #26A69A;
--primary-light: #E0F7F4;
--primary-dark: #1E8A80;

/* Secondary: 코랄 */
--secondary: #FF8A65;

/* Accent: 앰버 */
--accent: #F59E0B;

/* Background */
--background: #FAFEFE;
--background-subtle: #F5FAFA;
```

---

## 8. 환경변수

### Backend `.env`
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
THROTTLE_LIMIT=100  # 개발:100, 프로덕션:10

# OAuth2 (Phase 2)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

KAKAO_CLIENT_ID=xxx
KAKAO_CLIENT_SECRET=xxx
KAKAO_CALLBACK_URL=http://localhost:3000/api/auth/kakao/callback

NAVER_CLIENT_ID=xxx
NAVER_CLIENT_SECRET=xxx
NAVER_CALLBACK_URL=http://localhost:3000/api/auth/naver/callback
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## 9. 보안 체크리스트 (구현 완료)

- [x] httpOnly Cookie + SameSite=Strict
- [x] Token Rotation (Refresh)
- [x] CSRF 미들웨어
- [x] Rate Limiting (엔드포인트별)
- [x] Timing Attack 방지 (bcrypt 항상 실행)
- [x] Email Enumeration 방지
- [x] XSS 방지 (DOMPurify)
- [x] IP 해시 솔트
- [x] 파일 업로드 검증 (매직넘버)
- [x] Path Traversal 방지
- [x] Winston 로깅 (콘솔 비노출)

---

## 10. Phase 1 완료 기능

### 인증
- 회원가입 + 6자리 이메일 인증 (필수)
- 로그인/로그아웃 (Dual Token)
- 토큰 자동 갱신
- 비밀번호 찾기/재설정

### 게시글/댓글
- 게시글 CRUD (5개 카테고리)
- 댓글/대댓글 + 멘션
- 좋아요 토글
- 조회수 (IP 기반 중복 방지)
- 인기글 API
- 검색 (제목+내용+작성자)

### 사용자/알림
- 프로필 조회/수정
- 프로필 이미지 업로드
- 알림 (댓글, 대댓글, 멘션, 좋아요)
- 회원 탈퇴

### UI/UX
- 틸 컬러 팔레트
- 홈 대시보드 (인기글 + 카테고리 미리보기)
- 게시판 페이지네이션

---

## 11. Phase 2 완료 기능

### OAuth2 소셜 로그인
- Google, Kakao, Naver 3개 프로바이더
- Passport.js 전략 패턴
- 동일 이메일 정책: 로컬 계정 → 연동, 다른 OAuth → 에러

### 관리자 시스템
- RolesGuard + @Roles() / @Admin() 데코레이터
- 대시보드 통계 (유저/게시글/댓글/신고 수)
- 사용자 관리 (검색, 권한 변경, 삭제)
- 게시글 관리 (검색, 삭제)
- 신고 관리 (필터링, 처리)

### 신고 시스템
- 신고 유형: POST, COMMENT, USER
- 신고 상태: PENDING → REVIEWED/RESOLVED/DISMISSED
- 중복 신고 방지

### 북마크
- 게시글 북마크 토글
- 내 북마크 목록 조회
- 게시글 상세에서 북마크 상태 표시

---

## 12. Phase 3 예정 기능

| 기능 | 우선순위 | 비고 |
|------|---------|------|
| 이미지 최적화 (sharp) | P1 | 리사이즈/압축 |
| PWA / 푸시 알림 | P2 | |
| 검색 고도화 | P2 | 작성자별, 날짜별 필터 |
| 댓글 정렬 | P2 | 인기순/최신순 |
| 게시글 임시저장 | P3 | |

---

## 13. 기술 부채 (스케일업 시)

| 항목 | 현재 | 권장 |
|------|------|------|
| 조회수 캐시 | 메모리 Map | Redis |
| 토큰 정리 | setInterval | NestJS ScheduleModule |
| 에러 모니터링 | 콘솔 | Sentry |
| 이미지 저장 | 로컬 | S3 + CDN |

---

## 14. 목 데이터

```bash
cd backend && npx ts-node prisma/seed-mock.ts
# 10유저, 100게시글, 댓글, 좋아요 생성
# 테스트 계정: mock1@test.com ~ mock10@test.com (비밀번호: Test1234!)
```

---

## 15. 로컬 개발

```bash
# Backend (http://localhost:3000)
cd backend && pnpm dev

# Frontend (http://localhost:3001)
cd frontend && pnpm dev

# DB 마이그레이션
cd backend && pnpm prisma migrate dev
```

---

## 16. 금지 사항

1. **NextAuth 사용 금지** - 직접 구현한 Dual Token 사용
2. **서버 컴포넌트에서 인증 체크 금지** - Zustand (CSR)
3. **Middleware에서 인증 체크 금지** - 보안 헤더만
4. **localStorage 토큰 저장 금지** - XSS 취약

---

## 17. ⚠️ 실수 방지 주의사항

### TypeScript Import 주의
```typescript
// ❌ 잘못된 방식 - enum은 import type 불가
import type { PostCategory } from '../types';

// ✅ 올바른 방식 - enum은 값으로 사용하므로 import
import { PostCategory, type CreatePostInput } from '../types';
```

### 토큰 저장 위치
| 토큰 | 저장 위치 | 유효기간 |
|------|----------|---------|
| Access Token | Zustand (메모리) | 15분 |
| Refresh Token | httpOnly Cookie | 7일 |

### 인기글 API 로직
- **엔드포인트**: `GET /posts/hot`
- **조건**: 최근 24시간 게시글 (없으면 전체에서)
- **정렬**: 좋아요 DESC → 조회수 DESC
- **제한**: 5개

### 익명 게시글 처리
```typescript
// isAnonymous: true 일 때
{
  authorId: null,           // DB에 작성자 ID 저장 안함
  ipHash: hashIp(ip),       // IP만 해시로 저장
  author: null              // 응답에서 작성자 정보 없음
}
```

### 카테고리별 자동 처리
- `ANONYMOUS` 카테고리: 자동 익명 X (사용자가 isAnonymous 선택)
- 모든 카테고리에서 익명 선택 가능
