'use client';

import { MainLayout } from '@/components/layout';
import { MyReportsList } from '@/features/reports/components/my-reports-list';

export default function MyReportsPage() {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">신고 내역</h1>
        <MyReportsList />
      </div>
    </MainLayout>
  );
}
