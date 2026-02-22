'use client';

import { PenSquare, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePosts } from '../hooks/use-posts';
import { PostCategory, POST_CATEGORY_LABELS } from '../types';
import { PostCard } from './post-card';
import { PostListSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const SORTS = [
  { value: 'createdAt' as const, label: '최신순' },
  { value: 'viewCount' as const, label: '인기순' },
  { value: 'likeCount' as const, label: '좋아요순' },
];

const ITEMS_PER_PAGE = 20;

export function BoardList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category') as PostCategory | null;
  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const urlSearch = searchParams.get('q') || '';

  const [category, setCategory] = useState<PostCategory | undefined>(urlCategory || undefined);
  const [sort, setSort] = useState<'createdAt' | 'viewCount' | 'likeCount'>('createdAt');
  const [page, setPage] = useState(urlPage);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);

  // URL 변경 시 state 동기화
  useEffect(() => {
    setCategory(urlCategory || undefined);
    setPage(urlPage);
    setSearchQuery(urlSearch);
    setDebouncedSearch(urlSearch);
  }, [urlCategory, urlPage, urlSearch]);

  // 검색어 debounce (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length === 0 || searchQuery.length >= 2) {
        setDebouncedSearch(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 검색어 변경 시 URL 업데이트
  const updateSearchUrl = useCallback((query: string) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (query.length >= 2) params.set('q', query);
    params.set('page', '1');
    router.push(`/posts?${params.toString()}`);
  }, [category, router]);

  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      updateSearchUrl(debouncedSearch);
    }
  }, [debouncedSearch, urlSearch, updateSearchUrl]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    params.set('page', '1');
    router.push(`/posts?${params.toString()}`);
  };

  const {
    data,
    isLoading,
    error,
    refetch,
  } = usePosts({ category, sort, order: 'desc', limit: ITEMS_PER_PAGE, page, search: debouncedSearch || undefined });

  const posts = data?.data ?? [];
  const totalCount = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    params.set('page', newPage.toString());
    router.push(`/posts?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 카테고리 라벨 가져오기
  const getCategoryLabel = () => {
    if (!category) return '전체글';
    return POST_CATEGORY_LABELS[category] || '전체글';
  };

  // 글쓰기 URL 생성
  const getWriteUrl = () => {
    if (category) {
      return `/posts/new?category=${category}`;
    }
    return '/posts/new';
  };

  if (error) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="board-container">
      {/* Header with Write Button */}
      <div className="board-header">
        <h1 className="board-title">{getCategoryLabel()}</h1>
        <Button asChild size="sm">
          <Link href={getWriteUrl()} className="flex items-center gap-1.5">
            <PenSquare className="w-4 h-4" />
            글쓰기
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="board-search">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={category ? `${getCategoryLabel()}에서 검색...` : '전체 게시글에서 검색...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
              aria-label="검색어 지우기"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        {searchQuery.length > 0 && searchQuery.length < 2 && (
          <p className="text-xs text-muted-foreground mt-1">최소 2자 이상 입력해주세요</p>
        )}
      </div>

      {/* Sort & Count */}
      <div className="board-toolbar">
        <div className="board-sorts">
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className={
                sort === s.value
                  ? 'board-sort board-sort--active'
                  : 'board-sort'
              }
            >
              {s.label}
            </button>
          ))}
        </div>
        {totalCount > 0 && (
          <span className="board-count">
            총 {totalCount.toLocaleString()}개
          </span>
        )}
      </div>

      {/* Posts */}
      {isLoading ? (
        <PostListSkeleton count={10} />
      ) : posts.length > 0 ? (
        <>
          <div className="board-list">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="board-pagination">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="board-pagination__btn"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {generatePageNumbers(page, totalPages).map((pageNum, idx) => (
                pageNum === '...' ? (
                  <span key={`ellipsis-${idx}`} className="board-pagination__ellipsis">...</span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum as number)}
                    className={
                      page === pageNum
                        ? 'board-pagination__num board-pagination__num--active'
                        : 'board-pagination__num'
                    }
                  >
                    {pageNum}
                  </button>
                )
              ))}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="board-pagination__btn"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={<PenSquare className="h-12 w-12" />}
          title="아직 게시글이 없어요"
          description="첫 번째 글을 작성해보세요!"
          action={{
            label: '글쓰기',
            onClick: () => router.push(getWriteUrl()),
          }}
        />
      )}
    </div>
  );
}

// 페이지 번호 생성 헬퍼
function generatePageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];

  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', total);
  } else if (current >= total - 3) {
    pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }

  return pages;
}
