'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // 아직 초기화 안됨 - 대기
    if (!isInitialized) return;

    // 인증 안됨 - 로그인으로
    if (!accessToken) {
      router.replace('/login');
      return;
    }

    // user 정보 아직 없음 - 대기
    if (!user) return;

    // 이메일 미인증 - 회원가입 페이지로 (인증 단계)
    if (!user.isVerified) {
      router.replace('/register');
      return;
    }

    // 인증 완료 - 표시
    setIsReady(true);
  }, [isInitialized, accessToken, user, router]);

  // 준비 안됨 - 로딩 표시
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
