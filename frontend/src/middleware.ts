import { NextResponse, type NextRequest } from 'next/server';

/**
 * 미들웨어: 보안 헤더 + 인증 라우트 보호
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ========================================
  // 0. CSP nonce 생성 (요청별 고유값, Edge Runtime 호환)
  // ========================================
  const nonce = btoa(crypto.randomUUID());

  // ========================================
  // 1. 인증 필요 라우트 보호 (서버사이드)
  // ========================================
  const protectedRoutes = ['/admin', '/my', '/notifications', '/profile', '/posts/new', '/jobs/new'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // 동적 보호 라우트: /posts/[id]/edit, /posts/[id]/applicants
  const isDynamicProtectedRoute =
    /^\/posts\/[^/]+\/(edit|applicants)$/.test(pathname);

  if (isProtectedRoute || isDynamicProtectedRoute) {
    const refreshToken = request.cookies.get('refreshToken');
    if (!refreshToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Admin 라우트: 미들웨어에서는 인증 여부만 확인 (refreshToken 체크)
  // 실제 role 검증은 클라이언트 AdminLayout(useIsAdmin) + 백엔드 API(@Roles(ADMIN))에서 수행
  // 클라이언트 쿠키 기반 role 체크는 조작 가능하므로 사용하지 않음

  // ========================================
  // 2. 보안 헤더 (환경별 CSP)
  // ========================================
  const isDev = process.env.NODE_ENV === 'development';
  const apiUrlFull = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  // CSP connect-src는 origin 기반 매칭이므로 /api 경로 제거
  const apiOrigin = apiUrlFull.replace(/\/api\/?$/, '');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

  // CSP 설정: 개발 vs 프로덕션 분리
  // - 개발: 디버깅 편의를 위해 'unsafe-eval' 허용 (Next.js Fast Refresh, React DevTools 등)
  // - 프로덕션: 엄격한 보안 정책 적용
  const csp = isDev
    ? [
        // === 개발 환경 CSP (느슨함) ===
        "default-src 'self'",
        `script-src 'self' 'unsafe-inline' 'unsafe-eval'`, // HMR, DevTools 지원
        "style-src 'self' 'unsafe-inline'",
        `img-src 'self' data: blob: ${appUrl} http://localhost:* https://images.unsplash.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com`,
        "font-src 'self'",
        `connect-src 'self' ${apiOrigin} ws://localhost:* wss://localhost:*`, // WebSocket for HMR
        "frame-src 'none'",
        "object-src 'none'",
      ].join('; ')
    : [
        // === 프로덕션 환경 CSP (엄격함) ===
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
        "style-src 'self' 'unsafe-inline'", // Tailwind/Next.js 인라인 스타일 호환
        `img-src 'self' data: blob: ${appUrl} https://images.unsplash.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com`,
        "font-src 'self'",
        `connect-src 'self' ${apiOrigin}`,
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
      ].join('; ');

  // x-nonce 요청 헤더: Next.js가 이 값을 감지하여 자체 인라인 스크립트에 nonce를 자동 추가
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains',
  );
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );
  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: ['/((?!api/health|_next|_vercel|static|favicon.ico|sitemap.xml|robots.txt).*)'],
};
