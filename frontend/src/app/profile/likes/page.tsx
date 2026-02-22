'use client';

import { MainLayout } from '@/components/layout';
import { MyLikesList } from '@/features/profile/components';

export default function MyLikesPage() {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">좋아요한 글</h1>
        <MyLikesList />
      </div>
    </MainLayout>
  );
}
