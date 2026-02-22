'use client';

import { MainLayout } from '@/components/layout';
import { MyCommentsList } from '@/features/profile/components';

export default function MyCommentsPage() {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">내가 쓴 댓글</h1>
        <MyCommentsList />
      </div>
    </MainLayout>
  );
}
