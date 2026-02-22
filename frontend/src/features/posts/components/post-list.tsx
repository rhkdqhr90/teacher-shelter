'use client';

import { PenSquare, Loader2, Search, X } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInfinitePosts } from '../hooks/use-posts';
import { PostCategory, POST_CATEGORY_LABELS } from '../types';
import { PostCard } from './post-card';
import { PostListSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';
import { useDebounce } from '@/hooks/use-debounce';

const CATEGORIES = [
  { value: undefined, label: '전체' },
  { value: PostCategory.FREE, label: '자유' },
  { value: PostCategory.ANONYMOUS, label: '익명' },
  { value: PostCategory.KNOWHOW, label: '노하우' },
  { value: PostCategory.INFO, label: '정보' },
  { value: PostCategory.LEGAL_QNA, label: '법률Q&A' },
];

const SORTS = [
  { value: 'createdAt' as const, label: '최신순' },
  { value: 'viewCount' as const, label: '인기순' },
  { value: 'likeCount' as const, label: '좋아요순' },
];

export function PostList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category') as PostCategory | null;

  const [category, setCategory] = useState<PostCategory | undefined>(urlCategory || undefined);
  const [sort, setSort] = useState<'createdAt' | 'viewCount' | 'likeCount'>('createdAt');
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard navigation for post list
  const { containerRef: postListRef } = useKeyboardNavigation<HTMLDivElement>({
    selector: 'a.post-card',
    onSelect: (element) => {
      element.click();
    },
    loop: false,
    orientation: 'vertical',
  });

  // URL 카테고리 변경 시 state 동기화
  useEffect(() => {
    setCategory(urlCategory || undefined);
  }, [urlCategory]);

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts({
    category,
    sort,
    order: 'desc',
    limit: 10,
    search: debouncedSearch || undefined,
  });

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px',
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  if (error) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  // Flatten pages into single array
  const posts = data?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = data?.pages[0]?.meta.total ?? 0;

  return (
    <div>
      {/* Category Chips - 모바일에서만 표시 */}
      <div className="category-filters lg:hidden">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            onClick={() => {
              setCategory(cat.value);
              if (cat.value) {
                router.push(`/posts?category=${cat.value}`);
              } else {
                router.push('/');
              }
            }}
            className={
              category === cat.value
                ? 'category-chip category-chip--active'
                : 'category-chip'
            }
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={category ? `${POST_CATEGORY_LABELS[category]} 검색...` : '게시글 검색...'}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-foreground-muted hover:text-foreground"
              aria-label="검색어 지우기"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sort Tabs */}
      <div className="sort-tabs">
        <div className="flex gap-3 flex-1">
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className={
                sort === s.value
                  ? 'sort-tab sort-tab--active'
                  : 'sort-tab'
              }
            >
              {s.label}
            </button>
          ))}
        </div>
        {totalCount > 0 && (
          <span className="text-xs text-foreground-muted">
            총 {totalCount.toLocaleString()}개
          </span>
        )}
      </div>

      {/* Posts */}
      {isLoading ? (
        <PostListSkeleton count={5} />
      ) : posts.length > 0 ? (
        <div
          ref={postListRef}
          role="list"
          aria-label="게시글 목록"
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} searchQuery={debouncedSearch} />
          ))}

          {/* Load More Trigger */}
          <div ref={loadMoreRef} className="py-4">
            {isFetchingNextPage && (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            {!hasNextPage && posts.length > 0 && (
              <p className="text-center text-sm text-foreground-muted">
                모든 게시글을 불러왔습니다
              </p>
            )}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<PenSquare className="h-12 w-12" />}
          title="아직 게시글이 없어요"
          description="첫 번째 글을 작성해보세요!"
          action={{
            label: '글쓰기',
            onClick: () => router.push('/posts/new'),
          }}
        />
      )}
    </div>
  );
}
