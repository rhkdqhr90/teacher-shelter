'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  FileText,
  Image,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  adminVerificationsApi,
  VerificationRequest,
  ProcessVerificationData,
} from '@/features/verifications';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

function getStatusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          <Clock className="w-3 h-3" />
          대기 중
        </span>
      );
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="w-3 h-3" />
          승인됨
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <XCircle className="w-3 h-3" />
          반려됨
        </span>
      );
    default:
      return null;
  }
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) {
    return <Image className="w-4 h-4" />;
  }
  return <FileText className="w-4 h-4" />;
}

export default function AdminVerificationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // 인증 요청 목록 조회
  const { data, isLoading } = useQuery({
    queryKey: ['admin-verifications', statusFilter, page],
    queryFn: () =>
      adminVerificationsApi.getList({
        page,
        limit: 20,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      }),
  });

  // 인증 처리 뮤테이션
  const processMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProcessVerificationData }) =>
      adminVerificationsApi.process(id, data),
    onSuccess: (_, variables) => {
      const action = variables.data.status === 'APPROVED' ? '승인' : '반려';
      toast.success(`인증 요청이 ${action}되었습니다`);
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      setSelectedRequest(null);
      setShowRejectDialog(false);
      setRejectionReason('');
    },
    onError: (error: unknown) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error('처리 실패', errorMessage || '처리에 실패했습니다.');
    },
  });

  const handleApprove = (request: VerificationRequest) => {
    if (confirm('이 인증 요청을 승인하시겠습니까?')) {
      processMutation.mutate({
        id: request.id,
        data: { status: 'APPROVED' },
      });
    }
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    if (!rejectionReason.trim()) {
      toast.error('반려 사유를 입력해주세요');
      return;
    }
    processMutation.mutate({
      id: selectedRequest.id,
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
      },
    });
  };

  const openRejectDialog = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectDialog(true);
  };

  // 보안: 인증 파일은 관리자 전용 API 엔드포인트를 통해 접근
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  // 파일 보기/다운로드 URL 생성 (인증된 API 엔드포인트)
  const getFileUrl = (requestId: string) => `${apiUrl}/admin/verifications/${requestId}/file`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">인증 관리</h2>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as StatusFilter[]).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
          >
            {status === 'ALL' && '전체'}
            {status === 'PENDING' && '대기 중'}
            {status === 'APPROVED' && '승인됨'}
            {status === 'REJECTED' && '반려됨'}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">요청자</th>
                <th className="px-4 py-3 text-left font-medium">인증 유형</th>
                <th className="px-4 py-3 text-left font-medium">파일</th>
                <th className="px-4 py-3 text-left font-medium">상태</th>
                <th className="px-4 py-3 text-left font-medium">요청일</th>
                <th className="px-4 py-3 text-left font-medium">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-foreground-muted">
                    로딩 중...
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-foreground-muted">
                    인증 요청이 없습니다.
                  </td>
                </tr>
              ) : (
                data?.data.map((request) => (
                  <tr key={request.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{request.user?.nickname}</p>
                        <p className="text-xs text-foreground-muted">{request.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{request.verificationType}</p>
                      {request.note && (
                        <p className="text-xs text-foreground-muted truncate max-w-[150px]">
                          {request.note}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getFileIcon(request.fileType)}
                        <div>
                          <p className="text-xs truncate max-w-[120px]">{request.originalFileName}</p>
                          <p className="text-xs text-foreground-muted">
                            {(request.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <a
                          href={getFileUrl(request.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-muted rounded"
                          title="파일 보기"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <a
                          href={getFileUrl(request.id)}
                          download={request.originalFileName}
                          className="p-1.5 hover:bg-muted rounded"
                          title="파일 다운로드"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        {request.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleApprove(request)}
                              disabled={processMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => openRejectDialog(request)}
                              disabled={processMutation.isPending}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-foreground-muted">
              총 {data.meta.total}개 중 {(page - 1) * 20 + 1}-
              {Math.min(page * 20, data.meta.total)}개
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                {page} / {data.meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                disabled={page === data.meta.totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-lg border shadow-lg w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">인증 반려</h3>
            <div className="mb-4">
              <p className="text-sm text-foreground-muted mb-2">
                <span className="font-medium">{selectedRequest.user?.nickname}</span>님의{' '}
                <span className="font-medium">{selectedRequest.verificationType}</span> 인증 요청을
                반려합니다.
              </p>
              <label className="block text-sm font-medium mb-2">
                반려 사유 <span className="text-destructive">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="반려 사유를 입력해주세요"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-y"
                maxLength={500}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
              >
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={processMutation.isPending || !rejectionReason.trim()}
              >
                {processMutation.isPending ? '처리 중...' : '반려'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
