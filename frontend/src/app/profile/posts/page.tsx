'use client';

import { MainLayout } from '@/components/layout';
import { MyPostsList } from '@/features/profile/components';

export default function MyPostsPage() {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">내가 쓴 글</h1>
        <MyPostsList />
      </div>
    </MainLayout>
  );
}
