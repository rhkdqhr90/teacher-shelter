'use client';

import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { MyApplications } from '@/features/applications';
import { useIsAuthenticated } from '@/stores/auth-store';
import { useEffect } from 'react';

export default function MyApplicationsPage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?callbackUrl=/my/applications');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">내 지원 현황</h1>
          <p className="text-sm text-muted-foreground mt-1">
            지원한 구인공고 현황을 확인하세요
          </p>
        </div>

        <MyApplications />
      </div>
    </MainLayout>
  );
}
