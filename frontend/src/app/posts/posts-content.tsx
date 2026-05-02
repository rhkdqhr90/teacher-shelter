'use client';

import { MainLayout } from '@/components/layout';
import { BoardList } from '@/features/posts/components';

interface PostsContentProps {
  children?: React.ReactNode;
}

export function PostsContent({ children }: PostsContentProps) {
  return (
    <MainLayout>
      {children}
      <BoardList />
    </MainLayout>
  );
}
