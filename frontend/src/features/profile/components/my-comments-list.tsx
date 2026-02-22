'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MessageSquare } from 'lucide-react';
import { useMyComments } from '../hooks/use-profile';
import { CategoryBadge, type PostCategory } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export function MyCommentsList() {
  const { data, isLoading, error } = useMyComments();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-border">
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        댓글을 불러올 수 없습니다.
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-12 w-12" />}
        title="작성한 댓글이 없어요"
        description="게시글에 댓글을 남겨보세요!"
      />
    );
  }

  return (
    <div>
      {data.data.map((comment) => (
        <Link
          key={comment.id}
          href={`/posts/${comment.post.id}`}
          className="block p-4 border-b border-border hover:bg-background-subtle transition-colors"
        >
          {/* 원글 정보 */}
          <div className="flex items-center gap-2 mb-2 text-xs text-foreground-muted">
            <CategoryBadge category={comment.post.category as PostCategory} />
            <span className="line-clamp-1">{comment.post.title}</span>
          </div>

          {/* 내 댓글 */}
          <p className="text-sm text-foreground line-clamp-2 mb-2">
            {comment.content}
          </p>

          {/* 시간 */}
          <div className="text-xs text-foreground-muted">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
              locale: ko,
            })}
          </div>
        </Link>
      ))}

      {data.meta.totalPages > 1 && (
        <div className="p-4 text-center text-sm text-foreground-muted">
          총 {data.meta.total}개의 댓글
        </div>
      )}
    </div>
  );
}
