'use client';

import { SocialLoginButtons } from '@/features/auth/components/social-login-buttons';

export default function TestSocialLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-gray-900">소셜 로그인 테스트</h1>
          <p className="text-sm text-gray-500">
            테스트용 페이지입니다. (공개되지 않음)
          </p>
        </div>

        <SocialLoginButtons />

        <p className="text-xs text-gray-400 text-center">
          URL: /test-social-login
        </p>
      </div>
    </div>
  );
}
