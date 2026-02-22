'use client';

import { MainLayout } from '@/components/layout';
import { ProfileEditForm } from '@/features/profile/components';

export default function ProfileEditPage() {
  return (
    <MainLayout>
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">프로필 수정</h1>
        <ProfileEditForm />
      </div>
    </MainLayout>
  );
}
