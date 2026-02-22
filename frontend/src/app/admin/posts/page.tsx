'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { adminApi, type AdminPost } from '@/features/admin/services/admin-api';

const CATEGORY_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'FREE', label: '자유게시판' },
  { value: 'ANONYMOUS', label: '익명고민' },
  { value: 'HUMOR', label: '유머' },
  { value: 'INFO', label: '정보공유' },
  { value: 'KNOWHOW', label: '노하우' },
  { value: 'CLASS_MATERIAL', label: '수업자료' },
  { value: 'CERTIFICATION', label: '자격증' },
  { value: 'SCHOOL_EVENT', label: '학교행사' },
  { value: 'PARENT_COUNSEL', label: '학부모상담' },
  { value: 'TEACHER_DAYCARE', label: '보육교사' },
  { value: 'TEACHER_SPECIAL', label: '특수교사' },
  { value: 'TEACHER_KINDERGARTEN', label: '유치원교사' },
  { value: 'LEGAL_QNA', label: '법률Q&A' },
  { value: 'JOB_POSTING', label: '구인공고' },
];

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORY_OPTIONS.filter((o) => o.value).map((o) => [o.value, o.label])
);

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AdminPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const { toast } = useToast();

  const fetchPosts = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const data = await adminApi.getPosts({
          page,
          limit: 20,
          search: search || undefined,
          category: category || undefined,
        });
        setPosts(data.data);
        setMeta({ page: data.meta.page, totalPages: data.meta.totalPages });
        setSelectedIds(new Set()); // Reset selection on fetch
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    },
    [search, category]
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await adminApi.deletePost(deleteTarget.id);
      toast.success('게시글이 삭제되었습니다');
      fetchPosts(meta.page);
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('삭제 실패', '게시글을 삭제할 수 없습니다.');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Toggle single selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Toggle all selection
  const toggleSelectAll = () => {
    if (selectedIds.size === posts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(posts.map((p) => p.id)));
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    setIsBulkDeleting(true);
    try {
      const result = await adminApi.bulkDeletePosts(Array.from(selectedIds));
      toast.success(`${result.deletedCount}개의 게시글이 삭제되었습니다`);
      fetchPosts(meta.page);
    } catch (error) {
      console.error('Failed to bulk delete posts:', error);
      toast.error('삭제 실패', '게시글을 삭제할 수 없습니다.');
    } finally {
      setIsBulkDeleting(false);
      setIsBulkDeleteOpen(false);
    }
  };

  const isAllSelected = posts.length > 0 && selectedIds.size === posts.length;
  const hasSelection = selectedIds.size > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">게시글 관리</h2>
          <p className="text-muted-foreground">게시글을 검색하고 관리하세요</p>
        </div>
        {hasSelection && (
          <Button variant="destructive" onClick={() => setIsBulkDeleteOpen(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            선택 삭제 ({selectedIds.size})
          </Button>
        )}
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearch} className="flex flex-1 max-w-md gap-2">
          <Input
            placeholder="제목 또는 내용 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <select
          className="h-10 px-3 border rounded-md bg-background min-w-[140px]"
          value={category}
          onChange={handleCategoryChange}
        >
          {CATEGORY_OPTIONS.map((opt) => (
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
      ) : posts.length === 0 ? (
        <div className="text-muted-foreground py-12 text-center">게시글이 없습니다</div>
      ) : (
        <>
          {/* 데스크탑 테이블 */}
          <div className="hidden overflow-x-auto rounded-lg border lg:block">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">카테고리</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">제목</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">작성자</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">조회</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">좋아요</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">댓글</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">신고</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">작성일</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className={`hover:bg-muted/30 ${selectedIds.has(post.id) ? 'bg-primary/5' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(post.id)}
                        onChange={() => toggleSelect(post.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="bg-muted rounded-full px-2 py-1 text-xs">
                        {CATEGORY_LABELS[post.category] || post.category}
                      </span>
                    </td>
                    <td className="max-w-64 px-4 py-3 text-sm">
                      <span className="block truncate">{post.title}</span>
                      {post.isAnonymous && <span className="text-muted-foreground text-xs">(익명)</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">{post.author?.nickname || '-'}</td>
                    <td className="px-4 py-3 text-sm">{post.viewCount}</td>
                    <td className="px-4 py-3 text-sm">{post.likeCount}</td>
                    <td className="px-4 py-3 text-sm">{post.commentCount}</td>
                    <td className="px-4 py-3 text-sm">
                      {post._count.reports > 0 && <span className="text-red-500">{post._count.reports}</span>}
                      {post._count.reports === 0 && '-'}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/posts/${post.id}`} target="_blank">
                          <Button size="sm" variant="ghost" title="보기">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(post)} title="삭제">
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
            {/* 전체 선택/해제 */}
            <div className="flex items-center gap-2 px-1">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">전체 선택</span>
            </div>
            {posts.map((post) => (
              <div
                key={post.id}
                className={`bg-card space-y-3 rounded-lg border p-4 ${selectedIds.has(post.id) ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(post.id)}
                      onChange={() => toggleSelect(post.id)}
                      className="w-4 h-4 mt-1 cursor-pointer shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
                          {CATEGORY_LABELS[post.category] || post.category}
                        </span>
                        {post.isAnonymous && <span className="text-muted-foreground text-xs">(익명)</span>}
                      </div>
                      <h3 className="truncate text-sm font-medium">{post.title}</h3>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {post.author?.nickname || '-'} · {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link href={`/posts/${post.id}`} target="_blank">
                      <Button size="sm" variant="ghost" title="보기">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(post)} title="삭제">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="text-muted-foreground flex items-center gap-4 text-xs pl-7">
                  <span>조회 {post.viewCount}</span>
                  <span>좋아요 {post.likeCount}</span>
                  <span>댓글 {post.commentCount}</span>
                  {post._count.reports > 0 && <span className="text-red-500">신고 {post._count.reports}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 페이지네이션 */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => fetchPosts(meta.page - 1)}>
            이전
          </Button>
          <span className="px-3 py-2 text-sm">
            {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page >= meta.totalPages}
            onClick={() => fetchPosts(meta.page + 1)}
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
        title="게시글 삭제"
        description={`"${deleteTarget?.title}" 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        variant="destructive"
        isLoading={isDeleting}
      />

      {/* Bulk Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title="게시글 일괄 삭제"
        description={`선택한 ${selectedIds.size}개의 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        variant="destructive"
        isLoading={isBulkDeleting}
      />
    </div>
  );
}
