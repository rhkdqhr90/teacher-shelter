'use client';

import { MainLayout } from '@/components/layout';
import { PostForm } from '@/features/posts/components/post-form';
import { PostCategory } from '@/features/posts/types';

export default function NewJobPostingPage() {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">구인공고 등록</h1>
        <PostForm defaultCategory={PostCategory.JOB_POSTING} />
      </div>
    </MainLayout>
  );
}
