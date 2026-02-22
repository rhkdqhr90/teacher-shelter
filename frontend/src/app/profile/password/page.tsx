'use client';

import { MainLayout } from '@/components/layout';
import { ChangePasswordForm } from '@/features/profile/components';

export default function ChangePasswordPage() {
  return (
    <MainLayout>
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">비밀번호 변경</h1>
        <ChangePasswordForm />
      </div>
    </MainLayout>
  );
}
