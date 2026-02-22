'use client';

import { memo, useMemo } from 'react';
import { Eye, Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import type { Post } from '../types';
import { CategoryBadge, type PostCategory } from '@/components/ui/badge';
import { JOB_TYPE_LABELS } from '@/features/profile/types';
import { formatTimeAgo } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';

interface PostCardProps {
  post: Post;
  isHot?: boolean;
  searchQuery?: string;
}

// 검색어 하이라이팅 함수
function highlightText(text: string, query?: string): React.ReactNode {
  if (!query || query.length < 2) return text;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  if (parts.length === 1) return text;

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark
        key={index}
        className="bg-yellow-200 dark:bg-yellow-800 text-inherit rounded px-0.5"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export const PostCard = memo(function PostCard({ post, isHot, searchQuery }: PostCardProps) {
  const { setLastListUrl } = useAppStore();

  const authorDisplay = post.isAnonymous
    ? '익명'
    : post.author?.nickname || '탈퇴한 사용자';

  const authorInfo = !post.isAnonymous && post.author?.jobType
    ? `${JOB_TYPE_LABELS[post.author.jobType] || ''}${post.author.career ? ` ${post.author.career}년차` : ''}`
    : '';

  const timeAgo = formatTimeAgo(post.createdAt);

  const cardClass = isHot ? 'post-card post-card--hot' : 'post-card';

  // 검색어 하이라이팅 메모이제이션
  const highlightedTitle = useMemo(
    () => highlightText(post.title, searchQuery),
    [post.title, searchQuery]
  );

  const plainContent = useMemo(
    () => post.content.replace(/<[^>]*>/g, ''),
    [post.content]
  );

  const highlightedContent = useMemo(
    () => highlightText(plainContent, searchQuery),
    [plainContent, searchQuery]
  );

  const handleClick = () => {
    // 현재 목록 URL 저장 (상세→목록 복귀용)
    setLastListUrl(window.location.pathname + window.location.search);
  };

  return (
    <Link href={`/posts/${post.id}`} className={cardClass} onClick={handleClick}>
      <article>
        {/* Category + Title */}
        <div className="post-card__header">
          <CategoryBadge category={post.category as PostCategory} />
          <h3 className="post-card__title">{highlightedTitle}</h3>
          {post.commentCount > 0 && (
            <span className="text-primary text-sm font-medium">[{post.commentCount}]</span>
          )}
        </div>

        {/* Content Preview */}
        <p className="post-card__preview">
          {highlightedContent}
        </p>

        {/* Author & Time */}
        <div className="post-card__meta">
          <span className="post-card__author">
            {authorDisplay}
            {post.author?.isVerified && (
              <span className="post-card__verified" title="인증됨" aria-label="인증된 사용자">
                <span aria-hidden="true">✓</span>
              </span>
            )}
          </span>
          {authorInfo && (
            <>
              <span className="post-card__separator">·</span>
              <span>{authorInfo}</span>
            </>
          )}
          <span className="post-card__separator">·</span>
          <span>{timeAgo}</span>
        </div>

        {/* Stats */}
        <div className="post-card__stats" aria-label="게시글 통계">
          <span className="post-card__stat" aria-label={`좋아요 ${post.likeCount}개`}>
            <Heart aria-hidden="true" />
            <span aria-hidden="true">{post.likeCount}</span>
          </span>
          <span className="post-card__stat" aria-label={`댓글 ${post.commentCount}개`}>
            <MessageCircle aria-hidden="true" />
            <span aria-hidden="true">{post.commentCount}</span>
          </span>
          <span className="post-card__stat" aria-label={`조회수 ${post.viewCount}회`}>
            <Eye aria-hidden="true" />
            <span aria-hidden="true">{post.viewCount}</span>
          </span>
        </div>
      </article>
    </Link>
  );
});
