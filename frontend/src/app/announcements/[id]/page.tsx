import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Pin, Megaphone } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/lib/constants';

interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isPublished: boolean;
  createdAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getAnnouncement(id: string): Promise<Announcement | null> {
  try {
    const response = await fetch(`${API_URL}/announcements/${id}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const announcement = await getAnnouncement(id);

  if (!announcement) {
    return {
      title: '공지사항을 찾을 수 없습니다',
    };
  }

  return {
    title: announcement.title,
    description: announcement.content.slice(0, 160),
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const { id } = await params;
  const announcement = await getAnnouncement(id);

  if (!announcement) {
    notFound();
  }

  return (
    <MainLayout showSidebar={false}>
      <div className="mx-auto max-w-4xl">
        {/* 뒤로가기 */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/announcements" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              공지사항 목록
            </Link>
          </Button>
        </div>

        {/* 공지사항 상세 */}
        <article className="rounded-lg border bg-card p-8">
          {/* 헤더 */}
          <div className="mb-6 border-b pb-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              {announcement.isPinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  <Pin className="h-3 w-3" />
                  고정된 공지
                </span>
              )}
            </div>
            <h1 className="mb-3 text-2xl font-bold">{announcement.title}</h1>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(announcement.createdAt)}
            </div>
          </div>

          {/* 본문 */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap text-foreground">{announcement.content}</p>
          </div>
        </article>

        {/* 목록으로 */}
        <div className="mt-6 text-center">
          <Button variant="outline" asChild>
            <Link href="/announcements">목록으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
