import { Metadata } from 'next';
import { AnnouncementsContent } from './announcements-content';

export const metadata: Metadata = {
  title: '공지사항',
  description: '교사쉼터 공지사항 및 서비스 업데이트 소식',
};

interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isPublished: boolean;
  createdAt: string;
}

async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${apiUrl}/announcements`, {
      next: { revalidate: 60 }, // 1분마다 재검증
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch {
    return [];
  }
}

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return <AnnouncementsContent announcements={announcements} />;
}
