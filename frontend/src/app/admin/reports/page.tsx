'use client';

import { useEffect, useState, useCallback } from 'react';
import { Check, X, Eye } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { adminApi, type Report, type ReportAction } from '@/features/admin/services/admin-api';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: '대기', color: 'bg-yellow-100 text-yellow-800' },
  REVIEWED: { label: '검토됨', color: 'bg-blue-100 text-blue-800' },
  RESOLVED: { label: '처리완료', color: 'bg-green-100 text-green-800' },
  DISMISSED: { label: '기각', color: 'bg-gray-100 text-gray-800' },
};

const TYPE_LABELS: Record<string, string> = {
  POST: '게시글',
  COMMENT: '댓글',
  USER: '사용자',
};

const ACTION_LABELS: Record<ReportAction, string> = {
  NONE: '조치 없음',
  WARNING: '경고',
  POST_DELETE: '게시글 삭제',
  COMMENT_DELETE: '댓글 삭제',
  USER_BAN_1DAY: '1일 정지',
  USER_BAN_7DAYS: '7일 정지',
  USER_BAN_30DAYS: '30일 정지',
  USER_BAN_PERMANENT: '영구 정지',
};

// 신고 타입에 따라 사용 가능한 조치 필터링
const getAvailableActions = (reportType: 'POST' | 'COMMENT' | 'USER'): ReportAction[] => {
  const baseActions: ReportAction[] = ['NONE', 'WARNING'];
  const banActions: ReportAction[] = ['USER_BAN_1DAY', 'USER_BAN_7DAYS', 'USER_BAN_30DAYS', 'USER_BAN_PERMANENT'];

  switch (reportType) {
    case 'POST':
      return [...baseActions, 'POST_DELETE', ...banActions];
    case 'COMMENT':
      return [...baseActions, 'COMMENT_DELETE', ...banActions];
    case 'USER':
      return [...baseActions, ...banActions];
    default:
      return baseActions;
  }
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [processTarget, setProcessTarget] = useState<{
    report: Report;
    action: 'RESOLVED' | 'DISMISSED';
  } | null>(null);
  const [processingNote, setProcessingNote] = useState('');
  const [selectedAction, setSelectedAction] = useState<ReportAction>('NONE');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const fetchReports = async (page = 1) => {
    setLoading(true);
    try {
      const data = await adminApi.getReports({
        page,
        limit: 20,
        status: statusFilter || undefined,
      });
      setReports(data.data);
      setMeta({ page: data.meta.page, totalPages: data.meta.totalPages });
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleProcess = async () => {
    if (!processTarget) return;

    setIsProcessing(true);
    try {
      await adminApi.processReport(processTarget.report.id, {
        status: processTarget.action,
        processingNote: processingNote.trim() || undefined,
        action: processTarget.action === 'RESOLVED' ? selectedAction : 'NONE',
      });

      // 조치에 따른 성공 메시지
      let successMessage = processTarget.action === 'RESOLVED' ? '신고가 처리 완료되었습니다' : '신고가 기각되었습니다';
      if (processTarget.action === 'RESOLVED' && selectedAction !== 'NONE') {
        successMessage = `신고 처리 완료: ${ACTION_LABELS[selectedAction]}`;
      }

      toast.success(successMessage);
      fetchReports(meta.page);
    } catch (error) {
      console.error('Failed to process report:', error);
      toast.error('처리 실패', '신고를 처리할 수 없습니다.');
    } finally {
      setIsProcessing(false);
      setProcessTarget(null);
      setProcessingNote('');
      setSelectedAction('NONE');
    }
  };

  const closeProcessDialog = useCallback(() => {
    setProcessTarget(null);
    setProcessingNote('');
    setSelectedAction('NONE');
  }, []);

  const getTargetLink = (report: Report) => {
    if (report.type === 'POST' && report.targetPost) {
      return `/posts/${report.targetPost.id}`;
    }
    if (report.type === 'COMMENT' && report.targetComment) {
      // 댓글의 postId가 있으면 사용, 없으면 null
      const postId = report.targetComment.postId;
      if (postId) {
        return `/posts/${postId}#comment-${report.targetComment.id}`;
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">신고 관리</h2>
          <p className="text-muted-foreground">사용자 신고를 검토하고 처리하세요</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">전체</option>
          <option value="PENDING">대기</option>
          <option value="REVIEWED">검토됨</option>
          <option value="RESOLVED">처리완료</option>
          <option value="DISMISSED">기각</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          신고 내역이 없습니다
        </div>
      ) : (
        <>
          {/* 데스크탑 테이블 */}
          <div className="hidden lg:block rounded-lg border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">유형</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">신고자</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">대상</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">사유</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">상태</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">일시</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm">
                      {TYPE_LABELS[report.type] || report.type}
                    </td>
                    <td className="px-4 py-3 text-sm">{report.reporter.nickname}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-32">
                          {report.targetUser?.nickname ||
                            report.targetPost?.title?.slice(0, 20) ||
                            report.targetComment?.content?.slice(0, 20) ||
                            '-'}
                        </span>
                        {getTargetLink(report) && (
                          <Link
                            href={getTargetLink(report)!}
                            target="_blank"
                            className="text-primary hover:underline shrink-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm max-w-48 truncate">
                      {report.reason}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          STATUS_LABELS[report.status]?.color || ''
                        }`}
                      >
                        {STATUS_LABELS[report.status]?.label || report.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {report.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setProcessTarget({ report, action: 'RESOLVED' })}
                            title="처리완료"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setProcessTarget({ report, action: 'DISMISSED' })}
                            title="기각"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 리스트 */}
          <div className="lg:hidden space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-xs bg-muted">
                        {TYPE_LABELS[report.type] || report.type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          STATUS_LABELS[report.status]?.color || ''
                        }`}
                      >
                        {STATUS_LABELS[report.status]?.label || report.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate flex-1">
                        {report.targetUser?.nickname ||
                          report.targetPost?.title?.slice(0, 30) ||
                          report.targetComment?.content?.slice(0, 30) ||
                          '-'}
                      </p>
                      {getTargetLink(report) && (
                        <Link
                          href={getTargetLink(report)!}
                          target="_blank"
                          className="text-primary hover:underline shrink-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {report.reason}
                    </p>
                  </div>
                  {report.status === 'PENDING' && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setProcessTarget({ report, action: 'RESOLVED' })}
                        title="처리완료"
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setProcessTarget({ report, action: 'DISMISSED' })}
                        title="기각"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>신고자: {report.reporter.nickname}</span>
                  <span>·</span>
                  <span>{new Date(report.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 페이지네이션 */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page <= 1}
            onClick={() => fetchReports(meta.page - 1)}
          >
            이전
          </Button>
          <span className="px-3 py-2 text-sm">
            {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page >= meta.totalPages}
            onClick={() => fetchReports(meta.page + 1)}
          >
            다음
          </Button>
        </div>
      )}

      {/* Process Dialog */}
      <Dialog isOpen={!!processTarget} onClose={closeProcessDialog}>
        <DialogHeader onClose={closeProcessDialog}>
          {processTarget?.action === 'RESOLVED' ? '신고 처리 완료' : '신고 기각'}
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            {/* 신고 정보 요약 */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">신고 유형</span>
                <span className="font-medium">
                  {processTarget && TYPE_LABELS[processTarget.report.type]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">신고 대상</span>
                <span className="font-medium truncate max-w-48">
                  {processTarget?.report.targetUser?.nickname ||
                    processTarget?.report.targetPost?.title?.slice(0, 20) ||
                    processTarget?.report.targetComment?.content?.slice(0, 20) ||
                    '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">신고 사유</span>
                <span className="font-medium truncate max-w-48">
                  {processTarget?.report.reason}
                </span>
              </div>
            </div>

            {/* 처리 설명 */}
            <div className="text-sm text-muted-foreground">
              {processTarget?.action === 'RESOLVED' ? (
                <p>
                  신고를 <strong className="text-green-600">처리 완료</strong>로 변경합니다.
                  아래에서 적절한 조치를 선택해주세요.
                </p>
              ) : (
                <p>
                  신고를 <strong className="text-orange-600">기각</strong>합니다.
                  신고 내용이 커뮤니티 가이드라인 위반에 해당하지 않는다고 판단된 경우 선택하세요.
                </p>
              )}
            </div>

            {/* 조치 선택 (처리 완료일 때만) */}
            {processTarget?.action === 'RESOLVED' && (
              <div>
                <label htmlFor="reportAction" className="block text-sm font-medium mb-1">
                  조치 선택 <span className="text-red-500">*</span>
                </label>
                <select
                  id="reportAction"
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value as ReportAction)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  {getAvailableActions(processTarget.report.type).map((action) => (
                    <option key={action} value={action}>
                      {ACTION_LABELS[action]}
                    </option>
                  ))}
                </select>
                {selectedAction !== 'NONE' && (
                  <p className="text-xs mt-1 text-amber-600">
                    {selectedAction.includes('BAN')
                      ? '해당 사용자가 즉시 로그아웃되고 정지 기간 동안 로그인이 불가합니다.'
                      : selectedAction.includes('DELETE')
                        ? '해당 콘텐츠가 즉시 삭제됩니다. 이 작업은 되돌릴 수 없습니다.'
                        : ''}
                  </p>
                )}
              </div>
            )}

            {/* 처리 메모 */}
            <div>
              <label htmlFor="processingNote" className="block text-sm font-medium mb-1">
                처리 메모 (선택)
              </label>
              <textarea
                id="processingNote"
                value={processingNote}
                onChange={(e) => setProcessingNote(e.target.value)}
                placeholder="신고자에게 전달할 처리 결과를 입력하세요"
                className="w-full rounded-md border px-3 py-2 text-sm resize-none"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                이 메모는 신고자의 &quot;내 신고 내역&quot;에 표시됩니다.
              </p>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={closeProcessDialog} disabled={isProcessing}>
            취소
          </Button>
          <Button
            variant={processTarget?.action === 'DISMISSED' ? 'outline' : 'default'}
            onClick={handleProcess}
            disabled={isProcessing}
            className={processTarget?.action === 'DISMISSED' ? 'border-orange-500 text-orange-600 hover:bg-orange-50' : ''}
          >
            {isProcessing ? '처리 중...' : processTarget?.action === 'RESOLVED' ? '처리 완료' : '기각'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
