'use client';

import { type ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from './error-boundary';
import { ErrorState } from './error-state';

interface QueryErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * React Query와 연동되는 Error Boundary
 * 쿼리 에러 발생 시 해당 쿼리들을 자동으로 리셋합니다.
 */
export function QueryErrorBoundary({ children, fallback }: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          fallback={
            fallback || (
              <ErrorState
                title="데이터를 불러오지 못했어요"
                description="잠시 후 다시 시도해주세요"
                onRetry={reset}
              />
            )
          }
          onError={() => {
            // 에러 발생 시 추가 처리 가능
          }}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
