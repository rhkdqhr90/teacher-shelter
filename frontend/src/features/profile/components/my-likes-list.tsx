'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Eye, Heart, MessageSquare } from 'lucide-react';
import { useMyLikes } from '../hooks/use-profile';
import { CategoryBadge, type PostCategory } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export function MyLikesList() {
  const { data, isLoading, error } = useMyLikes();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-border">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        좋아요한 글을 불러올 수 없습니다.
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="h-12 w-12" />}
        title="좋아요한 글이 없어요"
        description="마음에 드는 글에 좋아요를 눌러보세요!"
      />
    );
  }

  return (
    <div>
      {data.data.map((post) => (
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          className="block p-4 border-b border-border hover:bg-background-subtle transition-colors"
        >
          <div className="flex items-center gap-2 mb-1">
            <CategoryBadge category={post.category as PostCategory} />
            {post.isAnonymous && (
              <span className="text-xs text-foreground-muted">(익명)</span>
            )}
          </div>
          <h3 className="font-medium text-foreground line-clamp-1 mb-2">
            {post.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-foreground-muted">
            {post.author && !post.isAnonymous && (
              <span>{post.author.nickname}</span>
            )}
            {post.isAnonymous && <span>익명</span>}
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {post.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {post.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {post.commentCount}
            </span>
            <span>
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
          </div>
        </Link>
      ))}

      {data.meta.totalPages > 1 && (
        <div className="p-4 text-center text-sm text-foreground-muted">
          총 {data.meta.total}개의 좋아요
        </div>
      )}
    </div>
  );
}
