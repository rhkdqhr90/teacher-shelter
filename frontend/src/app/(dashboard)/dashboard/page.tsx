'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { useIsAuthenticated, useUser } from '@/stores/auth-store';
import { useDashboardStats, useRecentActivity, useMyPosts, useMyComments } from '@/features/profile/hooks/use-profile';
import { useHotPosts } from '@/features/posts/hooks/use-posts';
import { POST_CATEGORY_LABELS } from '@/features/posts/types';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { PenSquare, MessageCircle, Heart, Bookmark, Flame, FileText, ChevronRight, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileCompletion } from '@/features/profile/components/profile-completion';
import { SERVER_URL } from '@/lib/constants';

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block p-5 bg-card border rounded-xl hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </Link>
  );
}

function MyActivityTabs() {
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const { data: postsData, isLoading: loadingPosts } = useMyPosts(1, 5);
  const { data: commentsData, isLoading: loadingComments } = useMyComments(1, 5);

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'posts'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          내가 쓴 글
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'comments'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          내 댓글
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'posts' && (
          loadingPosts ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : postsData?.data && postsData.data.length > 0 ? (
            <div className="space-y-2">
              {postsData.data.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs text-primary font-medium">
                        {POST_CATEGORY_LABELS[post.category as keyof typeof POST_CATEGORY_LABELS]}
                      </span>
                      <p className="font-medium truncate">{post.title}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {post.likeCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> {post.commentCount}
                    </span>
                  </div>
                </Link>
              ))}
              <Link
                href="/profile/posts"
                className="flex items-center justify-center gap-1 py-2 text-sm text-primary hover:underline"
              >
                전체 보기 <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <PenSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>아직 작성한 글이 없습니다</p>
              <Button asChild size="sm" variant="outline" className="mt-3">
                <Link href="/posts/new">첫 글 쓰기</Link>
              </Button>
            </div>
          )
        )}

        {activeTab === 'comments' && (
          loadingComments ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : commentsData?.data && commentsData.data.length > 0 ? (
            <div className="space-y-2">
              {commentsData.data.map((comment) => (
                <Link
                  key={comment.id}
                  href={`/posts/${comment.post.id}`}
                  className="block p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <p className="text-sm text-muted-foreground truncate mb-1">
                    {comment.post.title}
                  </p>
                  <p className="text-sm line-clamp-2">{comment.content.replace(/<[^>]*>/g, '')}</p>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ko })}
                  </span>
                </Link>
              ))}
              <Link
                href="/profile/comments"
                className="flex items-center justify-center gap-1 py-2 text-sm text-primary hover:underline"
              >
                전체 보기 <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>아직 작성한 댓글이 없습니다</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function CommunitySection() {
  const { data: hotPosts, isLoading: loadingHotPosts } = useHotPosts();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 인기글 */}
      <div className="bg-card border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-5 w-5 text-accent" />
          <h3 className="font-semibold">실시간 인기글</h3>
        </div>
        {loadingHotPosts ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-6 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : hotPosts && hotPosts.length > 0 ? (
          <div className="space-y-2">
            {hotPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="flex items-start gap-3 py-2 hover:bg-muted rounded-md px-2 -mx-2 transition-colors"
              >
                <span className="text-primary font-bold w-5 text-center">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{post.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{POST_CATEGORY_LABELS[post.category as keyof typeof POST_CATEGORY_LABELS]}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Heart className="h-3 w-3" /> {post.likeCount}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">
            아직 인기글이 없습니다
          </p>
        )}
      </div>

      {/* 빠른 링크 */}
      <div className="bg-card border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">게시판 바로가기</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(POST_CATEGORY_LABELS).map(([key, label]) => (
            <Link
              key={key}
              href={`/posts?category=${key}`}
              className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm font-medium"
            >
              <span>{label}</span>
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const user = useUser();
  const { data: stats, isLoading: loadingStats } = useDashboardStats();

  return (
    <div className="space-y-8">
      {/* 환영 메시지 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            {user?.profileImage ? (
              <img
                src={`${SERVER_URL}${user.profileImage}`}
                alt={user.nickname}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              안녕하세요, {user?.nickname}님!
            </h1>
            <p className="text-muted-foreground">오늘도 좋은 하루 되세요</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon">
            <Link href="/profile" title="설정">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild className="hidden sm:flex">
            <Link href="/posts/new" className="flex items-center gap-2">
              <PenSquare className="h-4 w-4" />
              글쓰기
            </Link>
          </Button>
        </div>
      </div>

      {/* 프로필 완성도 (미완성 시에만 표시) */}
      <ProfileCompletion />

      {/* 활동 통계 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingStats ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              icon={PenSquare}
              label="내가 쓴 글"
              value={stats?.postCount ?? 0}
              href="/profile/posts"
            />
            <StatCard
              icon={MessageCircle}
              label="내 댓글"
              value={stats?.commentCount ?? 0}
              href="/profile/comments"
            />
            <StatCard
              icon={Heart}
              label="받은 좋아요"
              value={stats?.receivedLikeCount ?? 0}
              href="/profile/posts"
            />
            <StatCard
              icon={Bookmark}
              label="북마크"
              value={stats?.bookmarkCount ?? 0}
              href="/profile/bookmarks"
            />
          </>
        )}
      </div>

      {/* 내 최근 활동 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">내 최근 활동</h2>
        <MyActivityTabs />
      </div>

      {/* 커뮤니티 소식 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">커뮤니티 소식</h2>
        <CommunitySection />
      </div>
    </div>
  );
}

function LoginPrompt() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <User className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">로그인이 필요합니다</h1>
      <p className="text-muted-foreground mb-6">
        대시보드를 이용하려면 로그인해주세요
      </p>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/">홈으로</Link>
        </Button>
        <Button asChild>
          <Link href="/login">로그인</Link>
        </Button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <MainLayout>
      {isAuthenticated ? <DashboardContent /> : <LoginPrompt />}
    </MainLayout>
  );
}
