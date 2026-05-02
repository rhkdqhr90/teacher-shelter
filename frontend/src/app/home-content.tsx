'use client';

import { MainLayout } from '@/components/layout';
import { HomeDashboard } from '@/features/posts/components';
import { PenSquare } from 'lucide-react';
import Link from 'next/link';

interface HomeContentProps {
  children?: React.ReactNode;
}

export function HomeContent({ children }: HomeContentProps) {
  return (
    <MainLayout>
      {children}
      <HomeDashboard />
      <Link href="/posts/new" className="write-fab lg:hidden">
        <PenSquare />
      </Link>
    </MainLayout>
  );
}
