'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMyInquiries } from '../hooks/use-inquiries';
import { INQUIRY_STATUS_LABELS, INQUIRY_TYPE_LABELS, type InquiryStatus } from '../types';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

const statusColorMap: Record<InquiryStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export function MyInquiriesList() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyInquiries(page);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border border-border rounded-lg">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <EmptyState
        icon={<HelpCircle className="w-12 h-12" />}
        title="문의 내역이 없습니다"
        description="남기신 문의와 답변이 여기에 표시됩니다"
      />
    );
  }

  const { data: inquiries, meta } = data;

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => (
        <div
          key={inquiry.id}
          className="p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-foreground">
                  {INQUIRY_TYPE_LABELS[inquiry.type]}
                </span>
                <span
                  className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    statusColorMap[inquiry.status]
                  )}
                >
                  {INQUIRY_STATUS_LABELS[inquiry.status]}
                </span>
              </div>

              <p className="text-sm font-medium text-foreground mb-1">
                {inquiry.subject}
              </p>

              <p className="text-sm text-foreground-muted mb-1 line-clamp-2 whitespace-pre-line">
                {inquiry.content}
              </p>

              <p className="text-xs text-foreground-muted">
                {formatDistanceToNow(new Date(inquiry.createdAt), {
                  addSuffix: true,
                  locale: ko,
                })}
              </p>

              {inquiry.response && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <p className="text-xs text-foreground-muted mb-1">관리자 답변</p>
                  <p className="text-foreground whitespace-pre-line">{inquiry.response}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-foreground-muted px-4">
            {page} / {meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
