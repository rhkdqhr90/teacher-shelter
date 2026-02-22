'use client';

import { type ReactNode, useEffect } from 'react';

import { Toaster } from '@/components/ui/toaster';
import { setupGlobalErrorHandlers } from '@/lib/logger';
import { initWebVitals } from '@/lib/web-vitals';

import { AuthProvider } from './auth-provider';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // 전역 에러 핸들러 및 Web Vitals 설정
  useEffect(() => {
    setupGlobalErrorHandlers();
    initWebVitals();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
