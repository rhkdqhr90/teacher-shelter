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
    imageUrl?: string | null;
    linkUrl?: string | null;
    alt: string;
    bannerText?: string | null;
    subText?: string | null;
    bgColor?: string | null;
    textColor?: string | null;
  };
}

function BannerContent({ banner }: BannerContentProps) {
  const isTextBanner = !banner.imageUrl && banner.bannerText;

  const content = (
    <div className="right-sidebar-ad">
      <div className="right-sidebar-ad__label">AD</div>
      <div className="right-sidebar-ad__image">
        {isTextBanner ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center rounded-lg"
            style={{
              backgroundColor: banner.bgColor || '#3B82F6',
              color: banner.textColor || '#FFFFFF',
            }}
          >
            <p className="text-sm font-bold leading-tight">{banner.bannerText}</p>
            {banner.subText && (
              <p className="text-xs mt-2 opacity-90 leading-tight">{banner.subText}</p>
            )}
          </div>
        ) : (
          <Image
            src={getImageUrl(banner.imageUrl)}
            alt={banner.alt}
            fill
            className="object-cover rounded-lg"
          />
        )}
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
