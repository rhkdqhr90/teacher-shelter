'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 프로덕션에서는 에러 모니터링 서비스로 전송 권장 (Sentry 등)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', error);
    }
    // TODO: Production에서는 Sentry.captureException(error) 등 사용
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">문제가 발생했습니다</h1>
        <p className="text-muted-foreground max-w-md">
          {error.message || '예기치 않은 오류가 발생했습니다. 다시 시도해주세요.'}
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Button onClick={reset}>다시 시도</Button>
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            홈으로
          </Button>
        </div>
      </div>
    </div>
  );
}
