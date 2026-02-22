'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Megaphone, ChevronRight, Pin } from 'lucide-react';
import { usePinnedAnnouncements } from '../hooks/use-announcements';

export const AnnouncementBanner = memo(function AnnouncementBanner() {
  const { data: announcements, isLoading } = usePinnedAnnouncements();

  const latestAnnouncement = announcements?.[0];

  if (isLoading || !latestAnnouncement) {
    return null;
  }

  return (
    <Link href="/announcements" className="announcement-banner">
      <div className="announcement-banner__icon">
        <Megaphone className="w-4 h-4" aria-hidden="true" />
      </div>
      <div className="announcement-banner__content">
        {latestAnnouncement.isPinned && (
          <Pin className="w-3 h-3 text-primary shrink-0" aria-hidden="true" />
        )}
        <span className="announcement-banner__title">
          {latestAnnouncement.title}
        </span>
      </div>
      <ChevronRight className="w-4 h-4 text-foreground-muted shrink-0" aria-hidden="true" />
    </Link>
  );
});
