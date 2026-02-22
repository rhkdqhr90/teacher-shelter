'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { ApplicantList } from '@/features/applications';
import { usePost } from '@/features/posts/hooks/use-posts';
import { useIsAuthenticated, useUser } from '@/stores/auth-store';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PostCategory } from '@/features/posts/types';

export default function ApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const { data: post, isLoading } = usePost(postId);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/posts/${postId}/applicants`);
    }
  }, [isAuthenticated, postId, router]);

  // 로딩 중
  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  // 권한 확인 (작성자만)
  if (post && post.author?.id !== user?.id) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-destructive">지원자 목록을 볼 권한이 없습니다.</p>
          <Link href={`/posts/${postId}`} className="text-primary hover:underline mt-4 inline-block">
            게시글로 돌아가기
          </Link>
        </div>
      </MainLayout>
    );
  }

  // 구인공고가 아닌 경우
  if (post && post.category !== PostCategory.JOB_POSTING) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-muted-foreground">구인공고만 지원자 목록을 볼 수 있습니다.</p>
          <Link href={`/posts/${postId}`} className="text-primary hover:underline mt-4 inline-block">
            게시글로 돌아가기
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* 뒤로가기 */}
        <Link
          href={`/posts/${postId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          공고로 돌아가기
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">지원자 관리</h1>
          {post && (
            <p className="text-sm text-muted-foreground mt-1">
              {post.title}
            </p>
          )}
        </div>

        <ApplicantList postId={postId} />
      </div>
    </MainLayout>
  );
}
