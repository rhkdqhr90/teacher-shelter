'use client';

import { MainLayout } from '@/components/layout';
import { MyBookmarksList } from '@/features/profile/components';

export default function MyBookmarksPage() {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">북마크</h1>
        <MyBookmarksList />
      </div>
    </MainLayout>
  );
}
