'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Bell, ChevronRight, Pin, Loader2 } from 'lucide-react';
import { useLatestAnnouncements } from '@/features/announcements/hooks/use-announcements';

export const AnnouncementWidget = memo(function AnnouncementWidget() {
  const { data: announcements, isLoading } = useLatestAnnouncements(3);

  return (
    <div className="sidebar-widget">
      <div className="sidebar-widget__header">
        <h3 className="sidebar-widget__title">
          <Bell className="w-4 h-4 text-primary" aria-hidden="true" />
          공지사항
        </h3>
        <Link
          href="/announcements"
          className="sidebar-widget__more"
          aria-label="공지사항 더보기"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="sidebar-widget__content">
        {isLoading ? (
          <div className="sidebar-widget__loading">
            <Loader2 className="w-4 h-4 animate-spin" aria-label="로딩 중" />
          </div>
        ) : announcements && announcements.length > 0 ? (
          <ul className="sidebar-widget__list">
            {announcements.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/announcements/${item.id}`}
                  className="sidebar-widget__item"
                >
                  {item.isPinned && (
                    <Pin className="w-3 h-3 text-primary shrink-0" aria-hidden="true" />
                  )}
                  <span className="sidebar-widget__item-title">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="sidebar-widget__empty">공지사항이 없습니다.</p>
        )}
      </div>
    </div>
  );
});
