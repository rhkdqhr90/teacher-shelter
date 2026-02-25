import type { Metadata } from 'next';
import { MainLayout } from '@/components/layout';
import { PostDetail } from '@/features/posts/components';
import { POST_CATEGORY_LABELS } from '@/features/posts/types';
import { API_URL } from '@/lib/constants';

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

// 서버에서 게시글 데이터 가져오기
async function getPost(id: string) {
  try {
    const res = await fetch(`${API_URL}/posts/${id}`, {
      next: { revalidate: 60 }, // 60초 캐시
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return {
      title: '게시글을 찾을 수 없습니다',
    };
  }

  // HTML 태그 제거하고 텍스트만 추출
  const plainContent = post.content.replace(/<[^>]*>/g, '').slice(0, 160);
  const categoryLabel = POST_CATEGORY_LABELS[post.category as keyof typeof POST_CATEGORY_LABELS] || '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://teacherlounge.co.kr';

  return {
    title: post.title,
    description: plainContent || `${categoryLabel} 게시글`,
    openGraph: {
      title: post.title,
      description: plainContent || `${categoryLabel} 게시글`,
      type: 'article',
      url: `${siteUrl}/posts/${id}`,
      siteName: '교사쉼터',
      locale: 'ko_KR',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: post.isAnonymous ? ['익명'] : [post.author?.nickname || ''],
      tags: [categoryLabel, '교사', '커뮤니티'],
    },
    twitter: {
      card: 'summary',
      title: post.title,
      description: plainContent || `${categoryLabel} 게시글`,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  return (
    <MainLayout showSidebar={true}>
      <div className="max-w-4xl">
        <PostDetail postId={id} />
      </div>
    </MainLayout>
  );
}
