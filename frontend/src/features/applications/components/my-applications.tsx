'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Loader2, Building2, Calendar, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useMyApplications, useCancelApplication } from '../hooks/use-applications';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  ApplicationStatus,
} from '../types';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export function MyApplications() {
  const { toast } = useToast();
  const { data: applications, isLoading, error } = useMyApplications();
  const cancelApplication = useCancelApplication();
  const [cancelId, setCancelId] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!cancelId) return;

    try {
      await cancelApplication.mutateAsync(cancelId);
      toast.success('지원이 취소되었습니다');
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error('취소 실패', errorMessage || '지원 취소에 실패했습니다.');
    }
    setCancelId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        지원 현황을 불러올 수 없습니다.
      </div>
    );
  }

  if (!applications?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">아직 지원한 공고가 없습니다.</p>
        <Button asChild variant="outline">
          <Link href="/jobs">구인공고 보러가기</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {applications.map((app) => (
          <div
            key={app.id}
            className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* 상태 */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded ${APPLICATION_STATUS_COLORS[app.status]}`}
                  >
                    {APPLICATION_STATUS_LABELS[app.status]}
                  </span>
                  {app.post && !app.post.isRecruiting && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      공고마감
                    </span>
                  )}
                </div>

                {/* 공고 정보 */}
                {app.post && (
                  <>
                    {app.post.organizationName && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {app.post.organizationName}
                      </div>
                    )}
                    <Link
                      href={`/posts/${app.postId}`}
                      className="font-medium text-foreground hover:text-primary line-clamp-1"
                    >
                      {app.post.title}
                    </Link>
                  </>
                )}

                {/* 지원일 */}
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                  <Calendar className="h-3.5 w-3.5" />
                  지원일:{' '}
                  {formatDistanceToNow(new Date(app.createdAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </div>
              </div>

              {/* 취소 버튼 (대기/검토중만) */}
              {(app.status === ApplicationStatus.PENDING ||
                app.status === ApplicationStatus.REVIEWING) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCancelId(app.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  취소
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancel}
        title="지원 취소"
        description="정말 지원을 취소하시겠습니까?"
        confirmLabel="취소하기"
        variant="destructive"
        isLoading={cancelApplication.isPending}
      />
    </>
  );
}
