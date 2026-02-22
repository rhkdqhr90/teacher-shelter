'use client';

import Link from 'next/link';
import { Megaphone, Pin, Calendar } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isPublished: boolean;
  createdAt: string;
}

interface AnnouncementsContentProps {
  announcements: Announcement[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays < 7) {
    return formatDistanceToNow(date, { addSuffix: true, locale: ko });
  }

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function AnnouncementsContent({ announcements }: AnnouncementsContentProps) {
  return (
    <MainLayout showSidebar={false}>
      <div className="mx-auto max-w-4xl">
        {/* 페이지 타이틀 */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Megaphone className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">공지사항</h1>
            <p className="text-sm text-muted-foreground">서비스 업데이트 및 중요 안내사항</p>
          </div>
        </div>

        {/* 공지사항 목록 */}
        {announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <article
                key={announcement.id}
                className="rounded-lg border bg-card p-6 transition-colors hover:bg-muted/50"
              >
                <div className="mb-2 flex items-center gap-2">
                  {announcement.isPinned && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      <Pin className="h-3 w-3" />
                      고정
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(announcement.createdAt)}
                  </span>
                </div>

                <h2 className="mb-2 text-lg font-semibold">{announcement.title}</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{announcement.content}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed py-16 text-center">
            <Megaphone className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">등록된 공지사항이 없습니다.</p>
          </div>
        )}

        {/* 문의 안내 */}
        <div className="mt-8 rounded-lg bg-muted/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            서비스 이용 중 궁금한 점이 있으시면{' '}
            <Link href="/faq" className="text-primary hover:underline">
              자주 묻는 질문
            </Link>
            을 확인하시거나{' '}
            <Link href="/support" className="text-primary hover:underline">
              문의하기
            </Link>
            를 이용해 주세요.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
