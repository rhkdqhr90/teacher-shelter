# UI/UX 변경 이력

이 문서는 프론트엔드 UI/UX 개선 사항을 기록합니다.

---

## 2026-02 업데이트

### 1. Dialog 컴포넌트 Portal 적용

**파일**: `src/components/ui/dialog.tsx`

**문제**: Dialog가 sticky header 내부에서 렌더링될 때 z-index 및 위치 문제 발생

**해결책**: React Portal을 사용하여 document.body에 직접 렌더링

```typescript
import { createPortal } from 'react-dom';

// 클라이언트 사이드에서만 Portal 사용
const [mounted, setMounted] = useState(false);
useEffect(() => {
  setMounted(true);
}, []);

if (!isOpen || !mounted) return null;

// Portal을 사용하여 body 직접 하위에 렌더링
return createPortal(dialogContent, document.body);
```

**주의사항**:
- SSR 환경에서 `document`가 없으므로 `mounted` 상태로 클라이언트 렌더링 보장
- 모든 Dialog는 이제 body 직접 하위에 렌더링됨

---

### 2. 알림 타입 동기화

**파일**:
- `src/features/notifications/notifications-api.ts`
- `src/features/notifications/components/notification-item.tsx`

**문제**: 백엔드에 8가지 알림 타입이 있지만 프론트엔드는 4가지만 정의됨

**추가된 알림 타입**:
```typescript
type NotificationType =
  | 'COMMENT'           // 기존
  | 'REPLY'             // 기존
  | 'LIKE'              // 기존
  | 'MENTION'           // 기존
  | 'NEW_APPLICATION'   // 추가: 새 지원자
  | 'APPLICATION_STATUS' // 추가: 지원 상태 변경
  | 'VERIFICATION_APPROVED' // 추가: 교사 인증 승인
  | 'VERIFICATION_REJECTED'; // 추가: 교사 인증 반려
```

**fallback 처리** (알 수 없는 타입 대비):
```typescript
const defaultConfig = {
  icon: Bell,
  getMessage: () => '새로운 알림이 있습니다.',
  color: 'text-gray-500',
};

const config = notificationConfig[notification.type] || defaultConfig;
```

---

### 3. 프로필 페이지 레이아웃 통일

**파일**: `src/app/profile/page.tsx`

**문제**: 프로필 페이지가 커스텀 레이아웃을 사용하여 헤더/푸터 없음

**해결책**: MainLayout 사용으로 변경

```typescript
import { MainLayout } from '@/components/layout/main-layout';

export default function ProfilePage() {
  return (
    <MainLayout showSidebar={false}>
      <div className="max-w-xl mx-auto space-y-6">
        {/* 프로필 콘텐츠 */}
      </div>
    </MainLayout>
  );
}
```

---

### 4. 구인공고 상세 페이지 UI 개선

**파일**: `src/features/posts/components/post-detail.tsx`

**변경 전**: 여러 div로 분리된 정보 박스
**변경 후**: 통합된 카드 형태 (채용 사이트 스타일)

**구조**:
```
┌─────────────────────────────────────────┐
│ 헤더: 기관명 + 모집상태 + 관리버튼      │
├─────────────────────────────────────────┤
│ 핵심정보: 위치, 급여, 근무시간 등       │
├─────────────────────────────────────────┤
│ 자격요건 │ 복리후생 (2컬럼)             │
├─────────────────────────────────────────┤
│ 연락처 (전화/이메일/카카오톡)           │
├─────────────────────────────────────────┤
│ 지원하기 폼                             │
└─────────────────────────────────────────┘
```

**주요 변경사항**:
- 그라데이션 헤더 배경: `bg-gradient-to-r from-primary/10 to-primary/5`
- 모집 상태 배지: 초록색(모집중) / 회색(마감)
- 작성자 관리 버튼 헤더로 이동
- 반응형 그리드 레이아웃

---

### 5. 네이버 지도 링크 추가

**파일**: `src/features/posts/components/post-detail.tsx`

**기능**: 구인공고 주소 클릭 시 네이버 지도에서 검색

```typescript
<a
  href={`https://map.naver.com/p/search/${encodeURIComponent(
    `${REGION_LABELS[post.region as Region]}${post.detailAddress ? ` ${post.detailAddress}` : ''}${post.organizationName ? ` ${post.organizationName}` : ''}`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-2 hover:text-primary transition-colors group"
>
```

**검색어 구성**: `지역 + 상세주소 + 기관명`

---

## 컴포넌트 사용 가이드

### Dialog 사용 시 주의사항

1. **Portal 사용**: Dialog는 자동으로 body에 렌더링됨
2. **포커스 관리**: 자동으로 첫 번째 포커스 가능한 요소에 포커스
3. **스크롤 잠금**: 열린 Dialog가 있으면 body 스크롤 잠금

### 알림 타입 추가 시

1. `notifications-api.ts`의 `NotificationType`에 타입 추가
2. `notification-item.tsx`의 `notificationConfig`에 설정 추가
3. 백엔드 `NotificationType` enum과 동기화 필수

### MainLayout 사용

```typescript
// 사이드바 포함 (기본값)
<MainLayout>...</MainLayout>

// 사이드바 없이
<MainLayout showSidebar={false}>...</MainLayout>
```

---

## 관련 문서

- [DEVELOPMENT_GUIDE.md](../backend/DEVELOPMENT_GUIDE.md) - 백엔드 개발 가이드
- [SECURITY_CHANGELOG.md](../backend/SECURITY_CHANGELOG.md) - 보안 수정 이력
