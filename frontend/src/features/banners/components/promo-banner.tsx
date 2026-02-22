'use client';

import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Pause, Play, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/constants';
import { usePromoBanners } from '../hooks/use-banners';

interface PromoBannerProps {
  autoPlay?: boolean;
  interval?: number;
}

export const PromoBanner = memo(function PromoBanner({
  autoPlay = true,
  interval = 5000,
}: PromoBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const { data: apiData, isLoading } = usePromoBanners();
  const banners = useMemo(() => apiData?.filter((b) => b.isActive !== false) || [], [apiData]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // 자동 재생
  useEffect(() => {
    if (!autoPlay || isPaused || banners.length <= 1) return;

    const timer = setInterval(goToNext, interval);
    return () => clearInterval(timer);
  }, [autoPlay, isPaused, interval, goToNext, banners.length]);

  const currentBanner = banners[currentIndex];

  // 로딩 중이면 스켈레톤 표시
  if (isLoading) {
    return (
      <div className="promo-banner">
        <div className="promo-banner__slide flex items-center justify-center bg-muted">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // 배너가 없으면 렌더링하지 않음
  if (banners.length === 0 || !currentBanner) {
    return null;
  }

  const BannerContent = (
    <div className="promo-banner__slide">
      <Image
        src={getImageUrl(currentBanner.imageUrl)}
        alt={currentBanner.alt}
        fill
        className="object-cover"
        priority={currentIndex === 0}
      />
    </div>
  );

  return (
    <div
      className="promo-banner"
      role="region"
      aria-roledescription="carousel"
      aria-label="프로모션 배너"
    >
      {/* 배너 슬라이드 */}
      {currentBanner.linkUrl ? (
        <Link href={currentBanner.linkUrl} className="promo-banner__link">
          {BannerContent}
        </Link>
      ) : (
        BannerContent
      )}

      {/* 컨트롤 (배너가 2개 이상일 때만) */}
      {banners.length > 1 && (
        <>
          {/* 이전/다음 버튼 */}
          <button
            onClick={goToPrev}
            className="promo-banner__nav promo-banner__nav--prev"
            aria-label="이전 배너"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="promo-banner__nav promo-banner__nav--next"
            aria-label="다음 배너"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* 하단 인디케이터 */}
          <div className="promo-banner__controls">
            {/* 일시정지/재생 버튼 */}
            <button
              onClick={togglePause}
              className="promo-banner__pause"
              aria-label={isPaused ? '자동 재생' : '일시정지'}
            >
              {isPaused ? (
                <Play className="w-3 h-3" />
              ) : (
                <Pause className="w-3 h-3" />
              )}
            </button>

            {/* 도트 인디케이터 */}
            <div className="promo-banner__dots" role="tablist">
              {banners.map((_, index) => (
                <button
                  key={index}
                  role="tab"
                  aria-selected={currentIndex === index}
                  aria-label={`배너 ${index + 1}`}
                  className={cn(
                    'promo-banner__dot',
                    currentIndex === index && 'promo-banner__dot--active'
                  )}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>

            {/* 현재 위치 표시 */}
            <span className="promo-banner__counter">
              {currentIndex + 1} / {banners.length}
            </span>
          </div>
        </>
      )}
    </div>
  );
});
