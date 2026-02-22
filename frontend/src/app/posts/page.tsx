'use client';

import { MainLayout } from '@/components/layout';
import { BoardList } from '@/features/posts/components';

export default function PostsPage() {
  return (
    <MainLayout>
      <BoardList />
    </MainLayout>
  );
}
