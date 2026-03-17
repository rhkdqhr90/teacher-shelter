'use client';

import { MainLayout } from '@/components/layout';
import { HomeDashboard } from '@/features/posts/components';
import { PenSquare } from 'lucide-react';
import Link from 'next/link';

export function HomeContent() {
  return (
    <MainLayout>
      {/* Dashboard Home */}
      <HomeDashboard />

      {/* FAB Write Button - Mobile Only */}
      <Link href="/posts/new" className="write-fab lg:hidden">
        <PenSquare />
      </Link>
    </MainLayout>
  );
}
