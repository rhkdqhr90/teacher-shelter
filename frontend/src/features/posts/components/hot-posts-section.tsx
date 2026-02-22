'use client';

import { Flame, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useHotPosts } from '../hooks/use-posts';

export function HotPostsSection() {
  const { data: hotPosts, isLoading } = useHotPosts();

  if (isLoading) {
    return (
      <div className="hot-posts">
        <div className="hot-posts__header">
          <Flame className="hot-posts__icon" />
          <span>실시간 인기글</span>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!hotPosts || hotPosts.length === 0) {
    return null;
  }

  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'hot-posts__rank hot-posts__rank--1';
      case 2:
        return 'hot-posts__rank hot-posts__rank--2';
      case 3:
        return 'hot-posts__rank hot-posts__rank--3';
      default:
        return 'hot-posts__rank hot-posts__rank--default';
    }
  };

  return (
    <div className="hot-posts">
      <div className="hot-posts__header">
        <Flame className="hot-posts__icon" />
        <span>실시간 인기글</span>
      </div>
      <div className="hot-posts__list">
        {hotPosts.slice(0, 5).map((post, index) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="hot-posts__item"
          >
            <span className={getRankClass(index + 1)}>{index + 1}</span>
            <span className="hot-posts__title">{post.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
