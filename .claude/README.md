# 교사쉼터 프로젝트 문서

## 문서 구조

```
.claude/
├── PROJECT_SPEC.md   ← 프로젝트 명세서 (메인)
├── TECHNICAL_SPEC.md ← 기술 아키텍처 명세
├── UI_UX_SPEC.md     ← UI/UX 디자인 명세 ⭐ NEW
├── DAILY_LOG.md      ← 일일 작업 기록
└── README.md         ← 이 파일

docs/
└── KNOWN_ISSUES.md   ← 버그/해결 기록
```

## 문서별 역할

### PROJECT_SPEC.md - 기능 명세
- 사용자 유형, 권한 체계
- 핵심 기능 정의
- 화면 흐름
- 데이터 모델
- API 엔드포인트

### TECHNICAL_SPEC.md - 기술 아키텍처
- Dual Token 인증 구현
- SSR/CSR 규칙
- 폴더 구조
- API 클라이언트 패턴

### UI_UX_SPEC.md - 디자인 명세
- 반응형 breakpoints
- 모바일/데스크톱 레이아웃
- 네비게이션 (하단 탭바, 햄버거 메뉴)
- 컴포넌트 설계
- 색상/타이포그래피
- 터치 인터랙션
- 접근성
