'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Flag, ChevronLeft, ChevronRight, FileText, MessageSquare, User } from 'lucide-react';
import { useMyReports } from '../hooks/use-reports';
import { REPORT_STATUS_LABELS, REPORT_TYPE_LABELS, type ReportType, type ReportStatus } from '../types';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

const statusColorMap: Record<ReportStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  REVIEWED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  DISMISSED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const typeIconMap: Record<ReportType, React.ReactNode> = {
  POST: <FileText className="w-4 h-4" />,
  COMMENT: <MessageSquare className="w-4 h-4" />,
  USER: <User className="w-4 h-4" />,
};

export function MyReportsList() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyReports(page);

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
        icon={<Flag className="w-12 h-12" />}
        title="신고 내역이 없습니다"
        description="신고한 내역이 여기에 표시됩니다"
      />
    );
  }

  const { data: reports, meta } = data;

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div
          key={report.id}
          className="p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-foreground-muted">
                  {typeIconMap[report.type]}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {REPORT_TYPE_LABELS[report.type]} 신고
                </span>
                <span
                  className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    statusColorMap[report.status]
                  )}
                >
                  {REPORT_STATUS_LABELS[report.status]}
                </span>
              </div>

              <p className="text-sm text-foreground mb-1 line-clamp-2">
                {report.reason}
              </p>

              <p className="text-xs text-foreground-muted">
                {formatDistanceToNow(new Date(report.createdAt), {
                  addSuffix: true,
                  locale: ko,
                })}
              </p>

              {report.processingNote && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <p className="text-xs text-foreground-muted mb-1">처리 결과</p>
                  <p className="text-foreground">{report.processingNote}</p>
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
