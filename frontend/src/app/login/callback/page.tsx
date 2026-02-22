'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { handleOAuthCallback } from '@/lib/auth-api';

// OAuth 에러 코드 → 사용자 메시지 매핑
const ERROR_MESSAGES: Record<string, string> = {
  account_exists: '이미 다른 방식으로 가입된 이메일입니다. 해당 방식으로 로그인해주세요.',
  login_failed: '소셜 로그인에 실패했습니다. 다시 시도해주세요.',
};

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      // URL에서 임시 코드 또는 에러 확인
      const code = searchParams.get('code');
      const errorCode = searchParams.get('error');

      if (errorCode) {
        setError(ERROR_MESSAGES[errorCode] || '로그인에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      if (!code) {
        setError('로그인 정보를 찾을 수 없습니다.');
        return;
      }

      try {
        // OAuth 콜백 처리 - 임시 코드로 토큰 교환 후 사용자 정보 조회 및 저장
        const user = await handleOAuthCallback(code);

        // 이메일 인증 여부에 따라 리다이렉트
        if (user.isVerified) {
          router.replace('/');
        } else {
          router.replace('/register'); // 추가 정보 입력 필요 시
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('OAuth callback error:', err);
        }
        setError('로그인 처리 중 오류가 발생했습니다.');
      }
    };

    processCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-4 text-center">
          <div className="rounded-lg bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-primary hover:underline"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">로그인 처리 중...</p>
      </div>
    </div>
  );
}
