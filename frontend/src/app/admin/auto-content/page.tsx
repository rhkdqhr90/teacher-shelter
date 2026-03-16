'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ExternalLink, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { adminApi, type AutoContent } from '@/features/admin/services/admin-api';

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'DRAFT (미승인)' },
  { value: 'PUBLISHED', label: 'PUBLISHED (승인됨)' },
  { value: 'ALL', label: '전체' },
];

const CATEGORY_LABELS: Record<string, string> = {
  FREE: '자유게시판',
  ANONYMOUS: '익명고민',
  HUMOR: '유머',
  INFO: '정보공유',
  KNOWHOW: '노하우',
  CLASS_MATERIAL: '수업자료',
  CERTIFICATION: '자격증',
  SCHOOL_EVENT: '학교행사',
  PARENT_COUNSEL: '학부모상담',
  TEACHER_DAYCARE: '보육교사',
  TEACHER_SPECIAL: '특수교사',
  TEACHER_KINDERGARTEN: '유치원교사',
  LEGAL_QNA: '법률Q&A',
  JOB_POSTING: '구인공고',
};

export default function AdminAutoContentPage() {
  const [items, setItems] = useState<AutoContent[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('DRAFT');
  const [approving, setApproving] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AutoContent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();

  const fetchItems = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const data = await adminApi.getAutoContent({
          page,
          limit: 20,
          status: status || undefined,
        });
        setItems(data.data);
        setMeta({ page: data.meta.page, totalPages: data.meta.totalPages });
      } catch (error) {
        console.error('Failed to fetch auto content:', error);
      } finally {
        setLoading(false);
      }
    },
    [status]
  );

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      await adminApi.approveAutoContent(id);
      toast.success('콘텐츠가 승인되었습니다');
      fetchItems(meta.page);
    } catch (error) {
      console.error('Failed to approve:', error);
      toast.error('승인 실패', '다시 시도해주세요.');
    } finally {
      setApproving(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await adminApi.deleteAutoContent(deleteTarget.id);
      toast.success('콘텐츠가 삭제되었습니다');
      fetchItems(meta.page);
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('삭제 실패', '다시 시도해주세요.');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">자동 콘텐츠</h2>
        <p className="text-muted-foreground">자동생성된 콘텐츠를 검토하고 승인하세요</p>
      </div>

      {/* 필터 */}
      <div className="flex gap-2">
        <select
          className="h-10 px-3 border rounded-md bg-background min-w-[180px]"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-muted-foreground py-12 text-center">
          {status === 'DRAFT' ? '승인 대기 중인 콘텐츠가 없습니다' : '자동생성 콘텐츠가 없습니다'}
        </div>
      ) : (
        <>
          {/* 데스크탑 테이블 */}
          <div className="hidden overflow-x-auto rounded-lg border lg:block">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">제목</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">카테고리</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">신뢰도</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">출처</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">상태</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">생성일</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="max-w-64 px-4 py-3 text-sm">
                      <span className="block truncate">{item.title}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="bg-muted rounded-full px-2 py-1 text-xs">
                        {CATEGORY_LABELS[item.category] || item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.confidence === 'high' ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          high
                        </span>
                      ) : item.confidence === 'medium' ? (
                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          medium
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.sourceName || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.status === 'DRAFT' ? (
                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          DRAFT
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          PUBLISHED
                        </span>
                      )}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/posts/${item.id}`} target="_blank">
                          <Button size="sm" variant="ghost" title="미리보기">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                        {item.status === 'DRAFT' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            title="승인"
                            onClick={() => handleApprove(item.id)}
                            disabled={approving === item.id}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(item)} title="삭제">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 리스트 */}
          <div className="space-y-3 lg:hidden">
            {items.map((item) => (
              <div key={item.id} className="bg-card space-y-3 rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
                        {CATEGORY_LABELS[item.category] || item.category}
                      </span>
                      {item.confidence === 'high' ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          high
                        </span>
                      ) : item.confidence === 'medium' ? (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          medium
                        </span>
                      ) : null}
                      {item.status === 'DRAFT' ? (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          DRAFT
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          PUBLISHED
                        </span>
                      )}
                    </div>
                    <h3 className="truncate text-sm font-medium">{item.title}</h3>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {item.sourceName || '-'} · {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link href={`/posts/${item.id}`} target="_blank">
                      <Button size="sm" variant="ghost" title="미리보기">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    {item.status === 'DRAFT' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        title="승인"
                        onClick={() => handleApprove(item.id)}
                        disabled={approving === item.id}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(item)} title="삭제">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 페이지네이션 */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => fetchItems(meta.page - 1)}>
            이전
          </Button>
          <span className="px-3 py-2 text-sm">
            {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page >= meta.totalPages}
            onClick={() => fetchItems(meta.page + 1)}
          >
            다음
          </Button>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="자동 콘텐츠 삭제"
        description={`"${deleteTarget?.title}" 콘텐츠를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
