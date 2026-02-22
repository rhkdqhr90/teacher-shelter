'use client';

import { memo, useCallback } from 'react';
import { Flame, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { QueryErrorBoundary } from '@/components/ui/query-error-boundary';
import { useOnReconnect } from '@/hooks/use-online-status';
import { useHotPosts, useCategoryPreviews } from '../hooks/use-posts';
import { CategoryBadge, type PostCategory as BadgeCategoryType } from '@/components/ui/badge';
import { PromoBanner } from '@/features/banners';
import { AnnouncementBanner, AnnouncementSection } from '@/features/announcements';
import { CategoryTabGroup } from './category-tab-group';

const HotPostsCarousel = memo(function HotPostsCarousel() {
  const { data: hotPosts, isLoading } = useHotPosts();

  if (isLoading) {
    return (
      <div className="dashboard-section">
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="로딩 중" />
        </div>
      </div>
    );
  }

  if (!hotPosts || hotPosts.length === 0) {
    return null;
  }

  return (
    <section className="dashboard-section dashboard-section--hot">
      <div className="dashboard-section__header">
        <h2 className="dashboard-section__title">
          <Flame className="w-5 h-5 text-accent" aria-hidden="true" />
          실시간 인기글
        </h2>
      </div>
      <div className="hot-carousel">
        {hotPosts.slice(0, 5).map((post, index) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="hot-carousel__item"
          >
            <span className={`hot-carousel__rank hot-carousel__rank--${index + 1}`}>
              {index + 1}
            </span>
            <div className="hot-carousel__content">
              <CategoryBadge category={post.category as BadgeCategoryType} />
              <span className="hot-carousel__title">{post.title}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
});

export function HomeDashboard() {
  const { refetch: refetchHot } = useHotPosts();
  const { refetch: refetchPreviews } = useCategoryPreviews();

  // 네트워크 재연결 시 데이터 새로고침
  const handleReconnect = useCallback(() => {
    refetchHot();
    refetchPreviews();
  }, [refetchHot, refetchPreviews]);

  useOnReconnect(handleReconnect);

  return (
    <div className="home-dashboard">
      {/* Promo Banner (이미지 캐러셀) */}
      <QueryErrorBoundary>
        <PromoBanner />
      </QueryErrorBoundary>

      {/* Announcement Banner (공지 띠배너) */}
      <QueryErrorBoundary>
        <AnnouncementBanner />
      </QueryErrorBoundary>

      {/* Welcome Banner */}
      <section className="dashboard-banner">
        <h1 className="dashboard-banner__title">
          교사쉼터에 오신 것을 환영합니다 👋
        </h1>
        <p className="dashboard-banner__desc">
          특수교사, 보육교사를 위한 커뮤니티에서 고민을 나누고 정보를 공유하세요.
        </p>
      </section>

      {/* Hot Posts */}
      <QueryErrorBoundary>
        <HotPostsCarousel />
      </QueryErrorBoundary>

      {/* Category Tab Group */}
      <QueryErrorBoundary>
        <CategoryTabGroup />
      </QueryErrorBoundary>

      {/* Announcement Section (별도 카드) */}
      <QueryErrorBoundary>
        <AnnouncementSection limit={3} />
      </QueryErrorBoundary>
    </div>
  );
}
