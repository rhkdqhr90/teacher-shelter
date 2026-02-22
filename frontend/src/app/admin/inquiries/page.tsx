'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Search, ChevronLeft, ChevronRight, Eye, Send, Loader2 } from 'lucide-react';
import { adminApi, type Inquiry, type InquiryStatus } from '@/features/admin/services/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  GENERAL: '일반 문의',
  ACCOUNT: '계정 관련',
  REPORT: '신고/불편',
  SUGGESTION: '서비스 제안',
  PARTNERSHIP: '제휴/협력',
  OTHER: '기타',
};

const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  PENDING: '대기중',
  IN_PROGRESS: '처리중',
  RESOLVED: '답변완료',
  CLOSED: '종료',
};

const INQUIRY_STATUS_COLORS: Record<InquiryStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | ''>('');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const { toast } = useToast();

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const params: { page: number; limit: number; status?: InquiryStatus } = {
        page,
        limit: 20,
      };
      if (statusFilter) {
        params.status = statusFilter;
      }
      const data = await adminApi.getInquiries(params);
      setInquiries(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
      toast.error('문의 목록을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [page, statusFilter]);

  const handleViewInquiry = async (id: string) => {
    try {
      const inquiry = await adminApi.getInquiry(id);
      setSelectedInquiry(inquiry);
      setResponseText(inquiry.response || '');
    } catch (error) {
      console.error('Failed to fetch inquiry:', error);
      toast.error('문의를 불러올 수 없습니다');
    }
  };

  const handleRespond = async () => {
    if (!selectedInquiry || !responseText.trim()) return;

    setIsResponding(true);
    try {
      const updated = await adminApi.respondInquiry(selectedInquiry.id, responseText);
      setSelectedInquiry(updated);
      toast.success('답변이 전송되었습니다');
      fetchInquiries();
    } catch (error) {
      console.error('Failed to respond:', error);
      toast.error('답변 전송에 실패했습니다');
    } finally {
      setIsResponding(false);
    }
  };

  const handleStatusChange = async (id: string, status: InquiryStatus) => {
    try {
      const updated = await adminApi.updateInquiryStatus(id, status);
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(updated);
      }
      fetchInquiries();
      toast.success('상태가 변경되었습니다');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('상태 변경에 실패했습니다');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">문의 관리</h2>
        <p className="text-muted-foreground">고객 문의를 확인하고 답변하세요</p>
      </div>

      {/* 필터 */}
      <div className="flex items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as InquiryStatus | '');
            setPage(1);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">전체 상태</option>
          {Object.entries(INQUIRY_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* 목록 */}
      <div className="rounded-lg border bg-card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
            <p>문의가 없습니다</p>
          </div>
        ) : (
          <div className="divide-y">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleViewInquiry(inquiry.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-muted">
                        {INQUIRY_TYPE_LABELS[inquiry.type] || inquiry.type}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${INQUIRY_STATUS_COLORS[inquiry.status]}`}
                      >
                        {INQUIRY_STATUS_LABELS[inquiry.status]}
                      </span>
                    </div>
                    <h3 className="font-medium truncate">{inquiry.subject}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {inquiry.email}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground shrink-0">
                    <p>{formatDate(inquiry.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* 문의 상세 모달 */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-muted">
                    {INQUIRY_TYPE_LABELS[selectedInquiry.type]}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${INQUIRY_STATUS_COLORS[selectedInquiry.status]}`}
                  >
                    {INQUIRY_STATUS_LABELS[selectedInquiry.status]}
                  </span>
                </div>
                <h3 className="font-semibold">{selectedInquiry.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {/* 본문 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* 문의자 정보 */}
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">이메일:</span>{' '}
                  <a href={`mailto:${selectedInquiry.email}`} className="text-primary hover:underline">
                    {selectedInquiry.email}
                  </a>
                </p>
                {selectedInquiry.user && (
                  <p>
                    <span className="text-muted-foreground">회원:</span>{' '}
                    {selectedInquiry.user.nickname} ({selectedInquiry.user.email})
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground">접수일:</span>{' '}
                  {formatDate(selectedInquiry.createdAt)}
                </p>
              </div>

              {/* 문의 내용 */}
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="text-sm font-medium mb-2">문의 내용</h4>
                <p className="text-sm whitespace-pre-wrap">{selectedInquiry.content}</p>
              </div>

              {/* 기존 답변 */}
              {selectedInquiry.response && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">답변</h4>
                    {selectedInquiry.respondedAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(selectedInquiry.respondedAt)}
                        {selectedInquiry.respondedBy && ` · ${selectedInquiry.respondedBy.nickname}`}
                      </span>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{selectedInquiry.response}</p>
                </div>
              )}

              {/* 답변 입력 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  {selectedInquiry.response ? '답변 수정' : '답변 작성'}
                </h4>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="답변 내용을 입력하세요..."
                  rows={5}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                />
              </div>
            </div>

            {/* 푸터 */}
            <div className="flex items-center justify-between p-4 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">상태 변경:</span>
                <select
                  value={selectedInquiry.status}
                  onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value as InquiryStatus)}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                >
                  {Object.entries(INQUIRY_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setSelectedInquiry(null)}>
                  닫기
                </Button>
                <Button
                  onClick={handleRespond}
                  disabled={!responseText.trim() || isResponding}
                >
                  {isResponding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      전송중...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      답변 전송
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
