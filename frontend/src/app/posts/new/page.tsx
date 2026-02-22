'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { PostForm } from '@/features/posts/components';
import type { PostCategory } from '@/features/posts/types';

function NewPostContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') as PostCategory | null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">글쓰기</h1>
      <PostForm defaultCategory={categoryParam || undefined} />
    </div>
  );
}

export default function NewPostPage() {
  return (
    <MainLayout showSidebar={false}>
      <Suspense fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}>
        <NewPostContent />
      </Suspense>
    </MainLayout>
  );
}
