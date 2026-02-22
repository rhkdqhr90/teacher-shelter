'use client';

import { Button } from '@/components/ui/button';
import { API_URL } from '@/lib/constants';

interface SocialLoginButtonsProps {
  disabled?: boolean;
}

export function SocialLoginButtons({ disabled }: SocialLoginButtonsProps) {
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleKakaoLogin = () => {
    window.location.href = `${API_URL}/auth/kakao`;
  };

  const handleNaverLogin = () => {
    window.location.href = `${API_URL}/auth/naver`;
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            소셜 로그인
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* Google */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={disabled}
          className="w-full"
          title="Google로 로그인"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        </Button>

        {/* Kakao */}
        <Button
          type="button"
          variant="outline"
          onClick={handleKakaoLogin}
          disabled={disabled}
          className="w-full bg-[#FEE500] hover:bg-[#FDD800] border-[#FEE500]"
          title="카카오로 로그인"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#000000"
              d="M12 3c-5.52 0-10 3.58-10 8 0 2.84 1.87 5.33 4.67 6.73-.2.74-.73 2.68-.84 3.1-.13.52.19.51.4.37.16-.1 2.59-1.76 3.64-2.47.69.1 1.4.15 2.13.15 5.52 0 10-3.58 10-8s-4.48-8-10-8z"
            />
          </svg>
        </Button>

        {/* Naver */}
        <Button
          type="button"
          variant="outline"
          onClick={handleNaverLogin}
          disabled={disabled}
          className="w-full bg-[#03C75A] hover:bg-[#02B350] border-[#03C75A] text-white hover:text-white"
          title="네이버로 로그인"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
