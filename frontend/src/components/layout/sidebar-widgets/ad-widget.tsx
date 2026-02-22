'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useSidebarBanners } from '@/features/banners';
import { getImageUrl } from '@/lib/constants';

export const AdWidget = memo(function AdWidget() {
  const { data: banners, isLoading } = useSidebarBanners();

  // 로딩 중
  if (isLoading) {
    return (
      <div className="ad-widget">
        <div className="ad-widget__label">AD</div>
        <div className="ad-widget__image flex items-center justify-center bg-muted">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // 첫 번째 배너만 표시 (우선순위 순으로 정렬되어 있음)
  const banner = banners?.[0];

  // 배너가 없으면 렌더링하지 않음
  if (!banner) {
    return null;
  }

  const content = (
    <div className="ad-widget">
      <div className="ad-widget__label">AD</div>
      <div className="ad-widget__image">
        <Image
          src={getImageUrl(banner.imageUrl)}
          alt={banner.alt}
          fill
          className="object-cover rounded-lg"
        />
      </div>
    </div>
  );

  if (banner.linkUrl) {
    return (
      <Link href={banner.linkUrl} target="_blank" rel="noopener noreferrer">
        {content}
      </Link>
    );
  }

  return content;
});
