'use client';

import { MainLayout } from '@/components/layout';
import { MyInquiriesList } from '@/features/inquiries/components/my-inquiries-list';

export default function MyInquiriesPage() {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">문의 내역</h1>
        <MyInquiriesList />
      </div>
    </MainLayout>
  );
}
