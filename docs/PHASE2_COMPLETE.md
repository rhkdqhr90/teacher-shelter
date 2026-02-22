# 교사쉼터 - 페이즈 2 완료 요약

## 완료된 기능 (페이즈 2)

### 1. OAuth2 소셜 로그인
- [x] Google 로그인
- [x] Kakao 로그인
- [x] Naver 로그인
- [x] OAuth 임시 코드 시스템 (보안: URL에 토큰 노출 방지)
- [x] 조건부 전략 로딩 (환경변수 없으면 비활성화)

### 2. 관리자 기능
- [x] 관리자 대시보드 통계 (사용자/게시글/댓글/신고 수)
- [x] 사용자 관리 (목록 조회, 역할 변경, 삭제)
- [x] 게시글 관리 (목록 조회, 삭제)
- [x] 댓글 관리 (삭제)
- [x] 역할 기반 접근 제어 (ADMIN 전용)

### 3. 신고 시스템
- [x] 게시글/댓글/사용자 신고 생성
- [x] 내 신고 목록 조회
- [x] 신고 상세 조회 (관리자)
- [x] 신고 처리 (관리자: 검토/해결/기각)
- [x] 중복 신고 방지
- [x] 자기 콘텐츠 신고 방지

### 4. 북마크/스크랩
- [x] 북마크 추가/삭제 (토글)
- [x] 내 북마크 목록 조회
- [x] 북마크 여부 확인

### 5. 이미지 최적화
- [x] sharp 라이브러리 적용
- [x] 자동 리사이즈 (프로필: 400x400, 게시글: 1200x1200)
- [x] WebP 변환 및 압축 (품질 80-85%)
- [x] EXIF 기반 자동 회전
- [x] GIF 애니메이션 원본 유지

### 6. 파일 관리
- [x] 게시글 삭제 시 이미지 자동 삭제
- [x] 고아 파일 자동 정리 (매일 새벽 3시 Cron)
- [x] 관리자 수동 고아 파일 정리 API

---

## 새로 추가된 API 엔드포인트

### 관리자 (`/admin`)
| Method | Path | 설명 |
|--------|------|------|
| GET | /stats | 대시보드 통계 |
| GET | /reports | 신고 목록 |
| GET | /reports/:id | 신고 상세 |
| PATCH | /reports/:id | 신고 처리 |
| GET | /users | 사용자 목록 |
| PATCH | /users/:id/role | 사용자 역할 변경 |
| DELETE | /users/:id | 사용자 삭제 |
| GET | /posts | 게시글 목록 |
| DELETE | /posts/:id | 게시글 삭제 |
| DELETE | /comments/:id | 댓글 삭제 |
| POST | /cleanup-orphan-files | 고아 파일 정리 |

### 신고 (`/reports`)
| Method | Path | 설명 |
|--------|------|------|
| POST | / | 신고 생성 |
| GET | /my | 내 신고 목록 |

### 북마크 (`/bookmarks`)
| Method | Path | 설명 |
|--------|------|------|
| POST | /posts/:postId | 북마크 토글 |
| GET | / | 내 북마크 목록 |
| GET | /posts/:postId/status | 북마크 여부 확인 |

### OAuth (`/auth`)
| Method | Path | 설명 |
|--------|------|------|
| GET | /google | Google 로그인 시작 |
| GET | /google/callback | Google 콜백 |
| GET | /kakao | Kakao 로그인 시작 |
| GET | /kakao/callback | Kakao 콜백 |
| GET | /naver | Naver 로그인 시작 |
| GET | /naver/callback | Naver 콜백 |
| POST | /oauth/exchange | OAuth 임시 코드 교환 |

---

## 새로 추가된 DB 스키마

### Report 모델
```prisma
model Report {
  id              String       @id @default(cuid())
  type            ReportType   // POST, COMMENT, USER
  reason          String       @db.Text
  status          ReportStatus @default(PENDING)
  reporterId      String
  targetUserId    String?
  targetPostId    String?
  targetCommentId String?
  processedById   String?
  processedAt     DateTime?
  processingNote  String?      @db.Text
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}
```

### Bookmark 모델
```prisma
model Bookmark {
  id        String   @id @default(cuid())
  userId    String
  postId    String
  createdAt DateTime @default(now())
  @@unique([userId, postId])
}
```

---

## 보안 개선 사항

### OAuth 보안
- **임시 코드 시스템**: URL에 accessToken 노출 방지
  - 1회용 코드 (사용 후 즉시 삭제)
  - 1분 만료
  - 메모리 캐시 (프로덕션에서 Redis 권장)

### 권한 검증
- **관리자 자기 권한 변경 방지**: adminId 비교
- **자기 콘텐츠 신고 방지**: reporterId와 authorId 비교
- **Limit 파라미터 상한**: MAX_LIMIT=100

---

## 환경변수 (신규)

### OAuth 설정 (선택사항)
```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Kakao OAuth
KAKAO_CLIENT_ID=your-client-id
KAKAO_CLIENT_SECRET=your-client-secret
KAKAO_CALLBACK_URL=http://localhost:3000/api/auth/kakao/callback

# Naver OAuth
NAVER_CLIENT_ID=your-client-id
NAVER_CLIENT_SECRET=your-client-secret
NAVER_CALLBACK_URL=http://localhost:3000/api/auth/naver/callback
```

---

## 목 데이터 (업데이트)

```bash
# 목 데이터 생성 (관리자, 북마크, 신고 포함)
cd backend && npx ts-node prisma/seed-mock.ts
```

| 항목 | 개수 |
|------|------|
| 관리자 | 1명 (`admin@test.com` / `Test1234!`) |
| 일반 유저 | 10명 |
| 게시글 | 100개 |
| 댓글 | ~180개 |
| 좋아요 | ~880개 |
| 북마크 | ~26개 |
| 신고 | 8개 |
| 알림 | 10개 |

---

## 주요 파일 (신규)

### Backend
| 파일 | 역할 |
|------|------|
| `admin/admin.controller.ts` | 관리자 API 컨트롤러 |
| `admin/admin.service.ts` | 관리자 비즈니스 로직 |
| `reports/reports.controller.ts` | 신고 API 컨트롤러 |
| `reports/reports.service.ts` | 신고 비즈니스 로직 |
| `bookmarks/bookmarks.controller.ts` | 북마크 API 컨트롤러 |
| `bookmarks/bookmarks.service.ts` | 북마크 비즈니스 로직 |
| `auth/strategies/google.strategy.ts` | Google OAuth 전략 |
| `auth/strategies/kakao.strategy.ts` | Kakao OAuth 전략 |
| `auth/strategies/naver.strategy.ts` | Naver OAuth 전략 |
| `auth/guards/roles.guard.ts` | 역할 기반 가드 |
| `auth/decorators/roles.decorator.ts` | Roles 데코레이터 |
| `uploads/uploads.service.ts` | 이미지 최적화 (sharp) |
| `uploads/orphan-cleanup.service.ts` | 고아 파일 자동 정리 |

### Frontend
| 파일 | 역할 |
|------|------|
| `lib/auth-api.ts` | OAuth 콜백 처리 함수 추가 |
| `app/login/callback/page.tsx` | OAuth 콜백 페이지 |

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2025-02-16 | OAuth2 소셜 로그인 (Google, Kakao, Naver) |
| 2025-02-16 | 관리자 기능 (대시보드, 사용자/게시글/댓글 관리) |
| 2025-02-16 | 신고 시스템 (생성, 조회, 처리) |
| 2025-02-16 | 북마크/스크랩 기능 |
| 2025-02-16 | 보안 개선 (OAuth 코드, 권한 검증, 자기 콘텐츠 신고 방지) |
| 2025-02-16 | 목 데이터 업데이트 (관리자, 북마크, 신고 추가) |
| 2025-02-16 | 이미지 최적화 (sharp, WebP 변환, 리사이즈) |
| 2025-02-16 | 고아 파일 자동 정리 (Cron + 관리자 API) |
| 2025-02-16 | 게시글 삭제 시 이미지 자동 삭제 |

---

## 다음 단계 (백로그)

| 과제 | 우선순위 |
|------|---------|
| PWA / 푸시 알림 | 낮음 |
| CDN 도입 | 낮음 |
