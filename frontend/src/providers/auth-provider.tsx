'use client';

import { useEffect, useRef } from 'react';
import { initializeAuth } from '@/lib/auth-api';
import { useAuthStore } from '@/stores/auth-store';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initStarted = useRef(false);

  useEffect(() => {
    // 이미 초기화 시작했으면 건너뛰기 (StrictMode 중복 실행 방지)
    if (initStarted.current) return;

    // 이미 초기화 완료되었으면 건너뛰기
    if (useAuthStore.getState().isInitialized) return;

    initStarted.current = true;
    initializeAuth();
  }, []);

  return <>{children}</>;
}
