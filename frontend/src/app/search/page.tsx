'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ArrowLeft, X, Loader2, AlertCircle } from 'lucide-react';
import { useInfinitePosts } from '@/features/posts/hooks/use-posts';
import { PostCard } from '@/features/posts/components/post-card';
import { PostListSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

const MIN_SEARCH_LENGTH = 2;

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 검색어 유효성 검사
  const isQueryValid = query.trim().length >= MIN_SEARCH_LENGTH;
  const shouldSearch = debouncedQuery.trim().length >= MIN_SEARCH_LENGTH;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length >= MIN_SEARCH_LENGTH) {
        setDebouncedQuery(trimmedQuery);
        router.replace(`/search?q=${encodeURIComponent(trimmedQuery)}`, { scroll: false });
      } else if (trimmedQuery.length === 0) {
        setDebouncedQuery('');
        router.replace('/search', { scroll: false });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, router]);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts({
    search: shouldSearch ? debouncedQuery : undefined,
    limit: 10,
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

  const handleClear = () => {
    setQuery('');
  };

  // Flatten pages into single array
  const posts = data?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = data?.pages[0]?.meta.total ?? 0;

  return (
    <main className="min-h-screen bg-background">
      {/* Header with Search */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-foreground-muted hover:text-foreground lg:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색어를 입력하세요"
              className="w-full pl-10 pr-10 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-foreground-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto max-w-2xl">
        {!query.trim() ? (
          <div className="p-8 text-center text-foreground-muted">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>게시글 제목이나 내용으로 검색해보세요</p>
          </div>
        ) : query.trim().length > 0 && !isQueryValid ? (
          <div className="p-8 text-center text-foreground-muted">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>최소 {MIN_SEARCH_LENGTH}자 이상 입력해주세요</p>
          </div>
        ) : isLoading ? (
          <PostListSkeleton count={5} />
        ) : error ? (
          <div className="p-8 text-center text-destructive">
            검색 중 오류가 발생했습니다.
          </div>
        ) : posts.length > 0 ? (
          <div>
            <div className="px-4 py-3 text-sm text-foreground-muted border-b border-border">
              &apos;{debouncedQuery}&apos; 검색 결과 {totalCount}건
            </div>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} searchQuery={debouncedQuery} />
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
                  모든 검색 결과를 불러왔습니다
                </p>
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<Search className="h-12 w-12" />}
            title="검색 결과가 없어요"
            description={`'${debouncedQuery}'에 대한 결과를 찾을 수 없습니다.`}
          />
        )}
      </div>
    </main>
  );
}
