'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login } from '@/lib/auth-api';
import { getErrorMessage } from '@/lib/error';
import { SocialLoginButtons } from './social-login-buttons';

const REMEMBER_EMAIL_KEY = 'rememberEmail';

/**
 * Validate redirect path is a safe relative URL (prevent open redirect)
 */
function getSafeRedirect(redirect: string | null): string {
  if (!redirect) return '/';
  // Only allow relative paths starting with /
  if (!redirect.startsWith('/') || redirect.startsWith('//')) return '/';
  return redirect;
}

export function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberEmail, setRememberEmail] = useState(false);
  const [savedEmail, setSavedEmail] = useState('');
  const isSubmitting = useRef(false);

  // Get redirect URL from query params (set by middleware or callbackUrl)
  const redirectParam = searchParams.get('redirect') || searchParams.get('callbackUrl');

  // 저장된 이메일 불러오기
  useEffect(() => {
    const stored = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (stored) {
      setSavedEmail(stored);
      setRememberEmail(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 중복 제출 방지
    if (isSubmitting.current || isPending) return;
    isSubmitting.current = true;

    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // 아이디 기억하기 처리
    if (rememberEmail) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

    try {
      const user = await login({ email, password });
      // 로그인 성공 - 이메일 인증 여부에 따라 리다이렉트
      if (user.isVerified) {
        router.replace(getSafeRedirect(redirectParam));
      } else {
        router.replace('/register'); // 이메일 인증 단계로
      }
    } catch (err: unknown) {
      isSubmitting.current = false;
      setError(getErrorMessage(err, t('invalidCredentials')));
      setIsPending(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{t('login')}</h1>
        <p className="text-muted-foreground">{t('loginSubtitle')}</p>
      </div>

      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              {t('email')}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="이메일을 입력하세요"
              defaultValue={savedEmail}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium">
                {t('password')}
              </label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                {t('forgotPassword')}
              </Link>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>

          <div className="flex items-center">
            <input
              id="rememberEmail"
              type="checkbox"
              checked={rememberEmail}
              onChange={(e) => {
                setRememberEmail(e.target.checked);
                if (!e.target.checked) {
                  localStorage.removeItem(REMEMBER_EMAIL_KEY);
                }
              }}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="rememberEmail" className="ml-2 text-sm text-muted-foreground">
              아이디 기억하기
            </label>
          </div>

          <Button type="submit" className="w-full" isLoading={isPending} disabled={isPending}>
            {isPending ? t('signingIn') : t('login')}
          </Button>
        </form>

        {/* 소셜 로그인 버튼 - 임시 비활성화 */}
        {/* <SocialLoginButtons disabled={isPending} /> */}

        <p className="text-center text-sm text-muted-foreground">
          {t('noAccount')}{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  );
}
