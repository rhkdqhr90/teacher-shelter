'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoginForm } from '@/features/auth/components/login-form';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // 아직 초기화 안됨 - 대기
    if (!isInitialized) return;

    // 이미 로그인됨
    if (accessToken && user) {
      // 이메일 인증 완료 → 대시보드
      if (user.isVerified) {
        router.replace('/dashboard');
      } else {
        // 이메일 미인증 → 인증 페이지
        router.replace('/register');
      }
      return;
    }

    // 초기화 완료 + 로그인 안됨 - 폼 표시
    setShowForm(true);
  }, [isInitialized, accessToken, user, router]);

  if (!showForm) {
    return (
      <div className="flex items-center justify-center min-h-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <LoginForm />;
}
