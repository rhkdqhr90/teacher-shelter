'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { logout } from '@/lib/auth-api';
import { useAuthStore } from '@/stores/auth-store';

export function UserNav() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { user } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) {
    return null;
  }

  const displayName = user.nickname?.trim() || user.email?.split('@')[0] || '';
  const initials = displayName
    ? displayName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace('/');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          {initials}
        </div>
        <span className="hidden text-sm font-medium sm:inline-block">{displayName}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowLogoutConfirm(true)}
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        <span className="ml-1 hidden sm:inline-block">{t('signOut')}</span>
      </Button>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title={t('signOutConfirmTitle')}
        description={t('signOutConfirmDescription')}
        confirmLabel={t('signOut')}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
        variant="destructive"
      />
    </div>
  );
}
