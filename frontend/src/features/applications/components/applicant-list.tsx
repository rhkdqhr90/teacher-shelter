'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Loader2, User, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApplicationsByPost, useUpdateApplicationStatus } from '../hooks/use-applications';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  ApplicationStatus,
  type Application,
} from '../types';
import { useToast } from '@/hooks/use-toast';
import { JOB_TYPE_LABELS } from '@/features/profile/types';

interface ApplicantListProps {
  postId: string;
}

export function ApplicantList({ postId }: ApplicantListProps) {
  const { toast } = useToast();
  const { data: applications, isLoading, error } = useApplicationsByPost(postId);
  const updateStatus = useUpdateApplicationStatus();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleStatusChange = async (app: Application, newStatus: ApplicationStatus) => {
    try {
      await updateStatus.mutateAsync({
        id: app.id,
        data: { status: newStatus },
      });
      toast.success(`상태가 "${APPLICATION_STATUS_LABELS[newStatus]}"(으)로 변경되었습니다`);
    } catch (error: any) {
      toast.error('상태 변경 실패', error?.response?.data?.message || '상태 변경에 실패했습니다.');
    }
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
        지원자 목록을 불러올 수 없습니다.
      </div>
    );
  }

  if (!applications?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        아직 지원자가 없습니다.
      </div>
    );
  }

  // 상태별 통계
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === ApplicationStatus.PENDING).length,
    reviewing: applications.filter((a) => a.status === ApplicationStatus.REVIEWING).length,
    accepted: applications.filter((a) => a.status === ApplicationStatus.ACCEPTED).length,
    rejected: applications.filter((a) => a.status === ApplicationStatus.REJECTED).length,
  };

  return (
    <div className="space-y-6">
      {/* 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3 bg-muted/30 rounded-lg text-center">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-muted-foreground">전체</div>
        </div>
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</div>
          <div className="text-xs text-yellow-600 dark:text-yellow-400">대기</div>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.reviewing}</div>
          <div className="text-xs text-blue-600 dark:text-blue-400">검토중</div>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.accepted}</div>
          <div className="text-xs text-green-600 dark:text-green-400">합격</div>
        </div>
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.rejected}</div>
          <div className="text-xs text-red-600 dark:text-red-400">불합격</div>
        </div>
      </div>

      {/* 지원자 목록 */}
      <div className="space-y-3">
        {applications.map((app) => {
          const isExpanded = expandedId === app.id;

          return (
            <div
              key={app.id}
              className="border border-border rounded-lg overflow-hidden"
            >
              {/* 헤더 */}
              <div
                className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/30"
                onClick={() => setExpandedId(isExpanded ? null : app.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {app.applicant?.nickname || '익명'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {app.applicant?.jobType && JOB_TYPE_LABELS[app.applicant.jobType]}
                      {app.applicant?.career && ` ${app.applicant.career}년차`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded ${APPLICATION_STATUS_COLORS[app.status]}`}
                  >
                    {APPLICATION_STATUS_LABELS[app.status]}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(app.createdAt), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* 상세 정보 */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                  {/* 연락처 */}
                  {(app.contactPhone || app.contactEmail || app.applicant?.email) && (
                    <div className="flex flex-wrap gap-4 text-sm">
                      {app.contactPhone && (
                        <a
                          href={`tel:${app.contactPhone}`}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Phone className="w-4 h-4" />
                          {app.contactPhone}
                        </a>
                      )}
                      {(app.contactEmail || app.applicant?.email) && (
                        <a
                          href={`mailto:${app.contactEmail || app.applicant?.email}`}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Mail className="w-4 h-4" />
                          {app.contactEmail || app.applicant?.email}
                        </a>
                      )}
                    </div>
                  )}

                  {/* 자기소개 */}
                  {app.coverLetter && (
                    <div>
                      <h5 className="text-sm font-medium mb-1">자기소개</h5>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded">
                        {app.coverLetter}
                      </p>
                    </div>
                  )}

                  {/* 상태 변경 버튼 */}
                  {app.status !== ApplicationStatus.CANCELLED && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {app.status !== ApplicationStatus.REVIEWING && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(app, ApplicationStatus.REVIEWING);
                          }}
                          disabled={updateStatus.isPending}
                        >
                          검토중으로
                        </Button>
                      )}
                      {app.status !== ApplicationStatus.ACCEPTED && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(app, ApplicationStatus.ACCEPTED);
                          }}
                          disabled={updateStatus.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          합격
                        </Button>
                      )}
                      {app.status !== ApplicationStatus.REJECTED && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(app, ApplicationStatus.REJECTED);
                          }}
                          disabled={updateStatus.isPending}
                        >
                          불합격
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
