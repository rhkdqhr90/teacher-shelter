'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Bell, ChevronRight, Pin, Loader2 } from 'lucide-react';
import { useLatestAnnouncements } from '../hooks/use-announcements';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface AnnouncementSectionProps {
  limit?: number;
}

export const AnnouncementSection = memo(function AnnouncementSection({
  limit = 3,
}: AnnouncementSectionProps) {
  const { data: announcements, isLoading } = useLatestAnnouncements(limit);

  return (
    <section className="announcement-section">
      <header className="announcement-section__header">
        <h2 className="announcement-section__title">
          <Bell className="w-5 h-5 text-primary" aria-hidden="true" />
          공지사항
        </h2>
        <Link
          href="/announcements"
          className="announcement-section__more"
        >
          더보기
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </header>

      <div className="announcement-section__list">
        {isLoading ? (
          <div className="announcement-section__loading">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" aria-label="로딩 중" />
          </div>
        ) : announcements && announcements.length > 0 ? (
          announcements.map((announcement) => (
            <Link
              key={announcement.id}
              href={`/announcements/${announcement.id}`}
              className="announcement-section__item"
            >
              <div className="announcement-section__item-content">
                {announcement.isPinned && (
                  <Pin className="w-3 h-3 text-primary shrink-0" aria-hidden="true" />
                )}
                <span className="announcement-section__item-title">
                  {announcement.title}
                </span>
              </div>
              <span className="announcement-section__item-date">
                {announcement.createdAt
                  ? formatDistanceToNow(new Date(announcement.createdAt), {
                      addSuffix: true,
                      locale: ko,
                    })
                  : ''}
              </span>
            </Link>
          ))
        ) : (
          <p className="announcement-section__empty">
            공지사항이 없습니다.
          </p>
        )}
      </div>
    </section>
  );
});
