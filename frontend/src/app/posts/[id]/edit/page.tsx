'use client';

import { MainLayout } from '@/components/layout';
import { PostForm } from '@/features/posts/components';
import { use } from 'react';

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const { id } = use(params);

  return (
    <MainLayout showSidebar={false}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">글 수정</h1>
        <PostForm mode="edit" postId={id} />
      </div>
    </MainLayout>
  );
}
