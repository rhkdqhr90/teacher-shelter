'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

const errorMessages: Record<string, string> = {
  Configuration: 'configurationError',
  AccessDenied: 'accessDenied',
  CredentialsSignin: 'credentialsError',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const t = useTranslations('auth');
  const errorType = searchParams.get('error') ?? 'Default';
  const messageKey = errorMessages[errorType] ?? 'authErrorDesc';

  return (
    <div className="w-full max-w-md space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t('authError')}</h1>
        <p className="text-muted-foreground">{t(messageKey)}</p>
      </div>

      <div className="flex justify-center gap-4">
        <Button asChild>
          <Link href="/login">{t('backToLogin')}</Link>
        </Button>
      </div>
    </div>
  );
}
