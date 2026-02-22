# React/Next.js 흔한 실수 모음집

프로젝트에서 발견된 버그와 해결 방법을 정리한 문서입니다.

---

## 1. Dialog/Modal 포커스 이동 버그

### 증상
- 모달 내 textarea에 입력하면 커서가 다른 input/select로 이동
- 입력 중 포커스가 갑자기 사라짐

### 원인
```tsx
// ❌ 잘못된 코드
function ParentComponent() {
  const [text, setText] = useState('');

  // 매 렌더링마다 새 함수 생성 → Dialog의 onClose prop 변경
  const handleClose = () => {
    setText('');
  };

  return (
    <Dialog isOpen={true} onClose={handleClose}>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
    </Dialog>
  );
}

// Dialog 컴포넌트 내부
useEffect(() => {
  if (isOpen) {
    // onClose가 변경될 때마다 실행됨!
    const firstInput = dialogRef.current.querySelector('input, select, textarea');
    firstInput?.focus(); // 포커스 강제 이동
  }
}, [isOpen, onClose]); // onClose가 의존성에 포함
```

### 해결 방법

**방법 1: useCallback으로 콜백 안정화**
```tsx
// ✅ 올바른 코드
const handleClose = useCallback(() => {
  setText('');
}, []);
```

**방법 2: useRef로 콜백 참조 (Dialog 컴포넌트 내부)**
```tsx
// ✅ 올바른 코드
function Dialog({ onClose, isOpen }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose; // 매번 업데이트하지만 ref 자체는 변경 안됨

  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onCloseRef.current();
  }, []); // 의존성 없음!

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]); // handleEscape는 안정적
}
```

**방법 3: useEffect 분리**
```tsx
// ✅ 포커스 로직과 이벤트 리스너를 분리
// 포커스 설정 (isOpen만 의존)
useEffect(() => {
  if (isOpen && !wasOpenRef.current) {
    firstElement?.focus();
    wasOpenRef.current = true;
  }
}, [isOpen]); // onClose 제외!

// 이벤트 리스너 (별도 effect)
useEffect(() => {
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, handleEscape]);
```

---

## 2. CSS 애니메이션과 Transform 충돌

### 증상
- 모달이 열릴 때 위치가 점프하거나 이동
- 애니메이션 종료 후 요소 위치가 달라짐

### 원인
```css
/* ❌ 잘못된 코드 */
.dialog {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%); /* CSS 클래스의 transform */
}

@keyframes dialog-show {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96); /* 애니메이션의 transform */
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
/* 애니메이션 종료 후 CSS 클래스의 transform으로 돌아가면서 충돌! */
```

### 해결 방법
```css
/* ✅ 올바른 코드 - animation-fill-mode: forwards 사용 */
.dialog {
  position: fixed;
  left: 50%;
  top: 50%;
  /* transform 제거 - 애니메이션이 완전히 제어 */
}

@keyframes dialog-show {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.animate-dialog {
  animation: dialog-show 0.2s ease-out forwards; /* forwards 필수! */
}
```

---

## 3. useEffect cleanup과 카운터 관리

### 증상
- 여러 모달이 열렸을 때 스크롤 잠금이 제대로 안 됨
- 모달 닫힌 후에도 스크롤이 잠긴 상태

### 원인
```tsx
// ❌ 잘못된 코드
let openCount = 0;

useEffect(() => {
  if (isOpen) {
    openCount++;
    document.body.style.overflow = 'hidden';
  }

  return () => {
    // 의존성 변경 시에도 cleanup 실행됨!
    if (isOpen) {
      openCount--;
      if (openCount === 0) {
        document.body.style.overflow = '';
      }
    }
  };
}, [isOpen, handleEscape]); // handleEscape 변경 시 cleanup → setup 재실행
// openCount가 --, ++ 반복되면서 꼬임
```

### 해결 방법
```tsx
// ✅ 올바른 코드 - 카운터 관리 effect 분리
useEffect(() => {
  if (isOpen) {
    openCount++;
    if (openCount === 1) {
      document.body.style.overflow = 'hidden';
    }
  }

  return () => {
    if (isOpen) {
      openCount--;
      if (openCount === 0) {
        document.body.style.overflow = '';
      }
    }
  };
}, [isOpen]); // isOpen만 의존! 다른 의존성으로 인한 재실행 방지
```

---

## 4. 이메일 템플릿 XSS 취약점

### 증상
- 사용자 입력이 이메일에 그대로 표시됨
- 악성 스크립트가 이메일 클라이언트에서 실행될 가능성

### 원인
```typescript
// ❌ 잘못된 코드
const html = `
  <p>안녕하세요, ${nickname}님!</p>
  <p>문의 내용: ${inquiry.content}</p>
`;
// nickname = "<script>alert('xss')</script>" 가능!
```

### 해결 방법
```typescript
// ✅ 올바른 코드
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

const html = `
  <p>안녕하세요, ${escapeHtml(nickname)}님!</p>
  <p>문의 내용: ${escapeHtml(inquiry.content)}</p>
`;
```

---

## 5. API 엔드포인트 권한 검사 누락

### 증상
- 비공개 데이터가 쿼리 파라미터로 노출됨
- 인증 없이 민감한 데이터 접근 가능

### 원인
```typescript
// ❌ 잘못된 코드
@Get()
findAll(@Query('includePrivate') includePrivate?: string) {
  // 누구나 ?includePrivate=true 로 접근 가능!
  return this.service.findAll(includePrivate === 'true');
}
```

### 해결 방법
```typescript
// ✅ 올바른 코드 - 별도 엔드포인트 분리
@Get()
findAllPublic() {
  return this.service.findAll(false); // 공개 데이터만
}

@Get('admin/all')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
findAllAdmin() {
  return this.service.findAll(true); // 관리자만 전체 조회
}
```

---

## 6. DTO 유효성 검사 누락

### 증상
- 너무 긴 입력이 DB에 저장됨
- 서버 메모리 과다 사용

### 원인
```typescript
// ❌ 잘못된 코드
export class CreatePostDto {
  @IsString()
  @MinLength(10)
  content: string; // MaxLength 없음!
}
```

### 해결 방법
```typescript
// ✅ 올바른 코드
export class CreatePostDto {
  @IsString()
  @MinLength(10)
  @MaxLength(10000) // 적절한 최대 길이 설정
  content: string;
}
```

---

## 체크리스트

### Dialog/Modal 구현 시
- [ ] `onClose` 콜백이 `useCallback`으로 감싸져 있는가?
- [ ] `useEffect` 의존성에 불필요한 콜백이 포함되어 있지 않은가?
- [ ] 포커스 관리와 이벤트 리스너가 분리되어 있는가?
- [ ] CSS transform과 애니메이션이 충돌하지 않는가?

### 보안
- [ ] 사용자 입력이 HTML에 삽입될 때 이스케이프 처리되는가?
- [ ] API 엔드포인트에 적절한 인증/권한 검사가 있는가?
- [ ] DTO에 MaxLength 등 적절한 제한이 있는가?

### 상태 관리
- [ ] 전역 카운터/상태가 effect cleanup에서 올바르게 관리되는가?
- [ ] 의존성 배열이 필요한 것만 포함하는가?
