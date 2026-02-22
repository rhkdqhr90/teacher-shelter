'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useSidebarBanners } from '@/features/banners';
import { getImageUrl } from '@/lib/constants';

export const RightSidebar = memo(function RightSidebar() {
  const { data: banners, isLoading } = useSidebarBanners();

  // 두 번째 배너부터 오른쪽 사이드바에 표시 (첫 번째는 왼쪽 사이드바에서 사용)
  const banner = banners?.[1] || banners?.[0];

  return (
    <aside className="hidden xl:block w-[160px] shrink-0">
      <div className="sticky top-[112px]">
        {/* 세로 광고 배너 */}
        {isLoading ? (
          <div className="right-sidebar-ad">
            <div className="right-sidebar-ad__label">AD</div>
            <div className="right-sidebar-ad__image flex items-center justify-center bg-muted">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        ) : banner ? (
          <BannerContent banner={banner} />
        ) : null}
      </div>
    </aside>
  );
});

interface BannerContentProps {
  banner: {
    id: string;
    imageUrl: string;
    linkUrl?: string | null;
    alt: string;
  };
}

function BannerContent({ banner }: BannerContentProps) {
  const content = (
    <div className="right-sidebar-ad">
      <div className="right-sidebar-ad__label">AD</div>
      <div className="right-sidebar-ad__image">
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
}
