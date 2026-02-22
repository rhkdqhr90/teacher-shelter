'use client';

import { Eye, Flag, Heart, Share2, Pencil, Trash2, MoreVertical, Bookmark, MapPin, Building2, Clock, Users, Calendar, Phone, Mail, MessageCircle, Briefcase, Banknote, CheckCircle, List } from 'lucide-react';
import { PostDetailSkeleton } from '@/components/ui/skeleton';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ReportModal } from '@/features/reports/components/report-modal';
import { convertMarkdownImages, formatTimeAgo } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// DOMPurify 설정: 안전한 속성만 허용
if (typeof window !== 'undefined') {
  // style 속성 완전히 제거 (CSS 인젝션 방지)
  DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
    if (data.attrName === 'style') {
      data.attrValue = '';
      data.keepAttr = false;
    }
  });

  // 위험한 URI 스키마 차단
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.hasAttribute('href')) {
      const href = (node.getAttribute('href') || '').trim().toLowerCase();
      if (href.startsWith('javascript:') || href.startsWith('data:')) {
        node.removeAttribute('href');
      }
    }
    if (node.hasAttribute('src')) {
      const src = (node.getAttribute('src') || '').trim().toLowerCase();
      if (src.startsWith('javascript:') || src.startsWith('data:text/html')) {
        node.removeAttribute('src');
      }
    }
  });
}
import { usePost, useToggleLike, useDeletePost, useToggleBookmark, useBookmarkStatus, useLikeStatus, useUpdatePost } from '../hooks/use-posts';
import { CommentSection } from './comment-section';
import { CategoryBadge } from '@/components/ui/badge';
import { QueryErrorBoundary } from '@/components/ui/query-error-boundary';
import { useUser, useIsAuthenticated } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { JOB_TYPE_LABELS } from '@/features/profile/types';
import { AnswerList } from '@/features/legal-qa';
import { ApplicationForm } from '@/features/applications';
import {
  PostCategory,
  JOB_SUB_CATEGORY_LABELS,
  REGION_LABELS,
  SALARY_TYPE_LABELS,
  SalaryType,
  EMPLOYMENT_TYPE_LABELS,
  type JobSubCategory,
  type Region,
  type EmploymentType,
} from '../types';

interface PostDetailProps {
  postId: string;
}

export function PostDetail({ postId }: PostDetailProps) {
  const router = useRouter();
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const { lastListUrl, setLastListUrl } = useAppStore();
  const { data: post, isLoading, error } = usePost(postId);
  const toggleLike = useToggleLike();
  const toggleBookmark = useToggleBookmark();
  const deletePost = useDeletePost();
  const updatePost = useUpdatePost();
  const { data: bookmarkStatus } = useBookmarkStatus(postId, !!user);
  const { data: likeStatus } = useLikeStatus(postId, !!user);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { toast } = useToast();

  const isTogglingRecruiting = updatePost.isPending;

  // 알림에서 댓글로 이동 시 해당 댓글로 스크롤
  useEffect(() => {
    if (!post) return;
    const hash = window.location.hash;
    if (hash) {
      // hash가 #comment-UUID 패턴인지 검증 (CSS selector injection 방지)
      const commentHashPattern = /^#comment-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!commentHashPattern.test(hash)) return;
      const elementId = hash.slice(1); // '#' 제거
      const timer = setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [post]);

  const isLiked = likeStatus?.liked || false;
  const isBookmarked = bookmarkStatus?.bookmarked || false;

  const isAuthor = user && post?.author && user.id === post.author.id;

  const handleLike = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!user.isVerified) {
      router.push('/register');
      return;
    }
    toggleLike.mutate(postId);
  };

  const handleBookmark = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!user.isVerified) {
      router.push('/register');
      return;
    }
    toggleBookmark.mutate(postId);
  };

  const handleEdit = () => {
    router.push(`/posts/${postId}/edit`);
  };

  const handleDelete = async () => {
    try {
      await deletePost.mutateAsync(postId);
      toast.success('게시글이 삭제되었습니다');
      router.push('/');
    } catch {
      toast.error('게시글 삭제 실패', '게시글을 삭제할 수 없습니다.');
    }
    setShowDeleteConfirm(false);
  };

  const handleToggleRecruiting = async () => {
    if (!post) return;
    try {
      await updatePost.mutateAsync({
        id: postId,
        data: { isRecruiting: !post.isRecruiting },
      });
      toast.success(post.isRecruiting ? '모집이 마감되었습니다' : '모집이 재개되었습니다');
    } catch {
      toast.error('상태 변경 실패', '모집 상태를 변경할 수 없습니다.');
    }
  };

  const handleReport = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!user.isVerified) {
      router.push('/register');
      return;
    }
    setShowReportModal(true);
  };

  if (isLoading) {
    return <PostDetailSkeleton />;
  }

  if (error || !post) {
    return (
      <div className="text-center py-12 text-destructive">
        게시글을 불러올 수 없습니다.
      </div>
    );
  }

  const authorDisplay = post.isAnonymous ? '익명' : post.author?.nickname || '탈퇴한 사용자';
  const authorInfo =
    !post.isAnonymous && post.author?.jobType
      ? `${JOB_TYPE_LABELS[post.author.jobType] || ''}${post.author.career ? ` ${post.author.career}년차` : ''}`
      : '';

  const timeAgo = formatTimeAgo(post.createdAt);

  const handleGoToList = () => {
    // 저장된 목록 URL로 이동 (없으면 홈으로)
    const targetUrl = lastListUrl || '/';
    setLastListUrl(null); // 사용 후 초기화
    router.push(targetUrl);
  };

  return (
    <div className="space-y-6">
      {/* Post Content */}
      <article className="post-detail">
        {/* Header with Category and Actions */}
        <div className="flex items-start justify-between post-detail__category">
          <CategoryBadge category={post.category} />

          {/* Author Actions (Edit/Delete) */}
          {isAuthor && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-foreground-muted hover:text-foreground rounded-md hover:bg-muted transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-32 bg-card border border-border rounded-md shadow-lg z-20 animate-fade-in">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleEdit();
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      수정
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      삭제
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="post-detail__title">{post.title}</h1>

        {/* 구인공고 정보 */}
        {post.category === PostCategory.JOB_POSTING && (
          <div className="border border-border rounded-xl overflow-hidden mb-6">
            {/* 헤더: 기관명 + 상태 */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded text-xs font-semibold ${
                        post.isRecruiting
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-400 text-white'
                      }`}
                    >
                      {post.isRecruiting ? '모집중' : '마감'}
                    </span>
                    {post.jobSubCategory && (
                      <span className="text-xs text-muted-foreground">
                        {JOB_SUB_CATEGORY_LABELS[post.jobSubCategory as JobSubCategory]}
                      </span>
                    )}
                    {post.employmentType && (
                      <span className="text-xs text-muted-foreground">
                        · {EMPLOYMENT_TYPE_LABELS[post.employmentType as EmploymentType]}
                      </span>
                    )}
                  </div>
                  {post.organizationName && (
                    <h2 className="text-xl font-bold text-foreground">
                      {post.organizationName}
                    </h2>
                  )}
                </div>
                {/* 작성자 관리 버튼 */}
                {isAuthor && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/posts/${postId}/applicants`}>
                      <Button size="sm" className="shadow-sm">
                        <Users className="w-4 h-4 mr-1.5" />
                        지원자 관리
                      </Button>
                    </Link>
                    <Button
                      variant={post.isRecruiting ? 'outline' : 'secondary'}
                      size="sm"
                      onClick={handleToggleRecruiting}
                      disabled={isTogglingRecruiting}
                      className="shadow-sm"
                    >
                      {post.isRecruiting ? '마감' : '재개'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* 핵심 정보 */}
            <div className="px-5 py-4 bg-background">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-sm">
                {post.region && (
                  <a
                    href={`https://map.naver.com/p/search/${encodeURIComponent(
                      `${REGION_LABELS[post.region as Region]}${post.detailAddress ? ` ${post.detailAddress}` : ''}${post.organizationName ? ` ${post.organizationName}` : ''}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-primary transition-colors group"
                  >
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-foreground group-hover:text-primary group-hover:underline">
                      {REGION_LABELS[post.region as Region]}
                      {post.detailAddress && ` ${post.detailAddress}`}
                    </span>
                  </a>
                )}
                {post.salaryType && (
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-medium text-foreground">
                      {post.salaryType === SalaryType.NEGOTIABLE
                        ? '급여 협의'
                        : post.salaryMin && post.salaryMax
                          ? `${SALARY_TYPE_LABELS[post.salaryType as SalaryType]} ${post.salaryMin.toLocaleString()}~${post.salaryMax.toLocaleString()}${post.salaryType === SalaryType.MONTHLY ? '만원' : '원'}`
                          : post.salaryMin
                            ? `${SALARY_TYPE_LABELS[post.salaryType as SalaryType]} ${post.salaryMin.toLocaleString()}${post.salaryType === SalaryType.MONTHLY ? '만원' : '원'}~`
                            : SALARY_TYPE_LABELS[post.salaryType as SalaryType]}
                    </span>
                  </div>
                )}
                {post.workingHours && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{post.workingHours}</span>
                  </div>
                )}
                {post.recruitCount && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{post.recruitCount}명 모집</span>
                  </div>
                )}
                {post.deadline && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>
                      ~{new Date(post.deadline).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                      {post.isAutoClose && ' (자동)'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 요구자격 / 복리후생 */}
            {(post.requirements || post.benefits) && (
              <div className="border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                  {post.requirements && (
                    <div className="px-5 py-4">
                      <h4 className="flex items-center gap-2 font-semibold text-sm mb-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        자격요건
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {post.requirements}
                      </p>
                    </div>
                  )}
                  {post.benefits && (
                    <div className="px-5 py-4">
                      <h4 className="flex items-center gap-2 font-semibold text-sm mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        복리후생
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {post.benefits}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 연락처 */}
            {(post.contactPhone || post.contactEmail || post.contactKakao) && (
              <div className="border-t border-border px-5 py-4 bg-muted/30">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  {post.contactPhone && (
                    <a
                      href={`tel:${post.contactPhone}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Phone className="w-4 h-4" />
                      {post.contactPhone}
                    </a>
                  )}
                  {post.contactEmail && (
                    <a
                      href={`mailto:${post.contactEmail}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Mail className="w-4 h-4" />
                      {post.contactEmail}
                    </a>
                  )}
                  {post.contactKakao && (
                    <span className="flex items-center gap-2 text-foreground">
                      <MessageCircle className="w-4 h-4 text-yellow-500" />
                      {post.contactKakao}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 지원하기 (본인 글이 아닌 경우만) */}
            {!isAuthor && (
              <ApplicationForm
                postId={postId}
                isAuthenticated={isAuthenticated}
                isRecruiting={post.isRecruiting || false}
              />
            )}
          </div>
        )}

        {/* Author Info */}
        <div className="post-detail__author">
          <div className="post-detail__avatar">
            <span>{authorDisplay[0]}</span>
          </div>
          <div className="post-detail__author-info">
            <div className="post-detail__author-name">
              {authorDisplay}
              {post.author?.isVerified && (
                <span className="ml-1 text-secondary" title="인증된 교사">✓</span>
              )}
            </div>
            <div className="post-detail__author-meta">
              {authorInfo && <span className="mr-2">{authorInfo}</span>}
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className="post-detail__content prose prose-sm max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(convertMarkdownImages(post.content), {
              ADD_TAGS: ['img'],
              ADD_ATTR: ['loading', 'class', 'target', 'rel'],
              ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'loading', 'class', 'target', 'rel'],
              ALLOW_DATA_ATTR: false,
              FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
              FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
            }),
          }}
        />

        {/* Stats & Actions */}
        <div className="post-detail__actions">
          <div className="post-detail__stats">
            <span className="post-detail__stat">
              <Eye className="w-4 h-4" />
              조회 {post.viewCount.toLocaleString()}
            </span>
          </div>

          <div className="post-detail__buttons">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={toggleLike.isPending}
              className={`flex items-center gap-1.5 ${isLiked ? 'text-red-500' : ''}`}
              title={!user ? '로그인이 필요합니다' : !user.isVerified ? '이메일 인증이 필요합니다' : '좋아요'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              {post.likeCount}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              disabled={toggleBookmark.isPending}
              className={isBookmarked ? 'text-primary' : ''}
              title={!user ? '로그인이 필요합니다' : !user.isVerified ? '이메일 인증이 필요합니다' : '북마크'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title="공유"
              onClick={async () => {
                const shareUrl = `${window.location.origin}/posts/${postId}`;
                const shareData = {
                  title: post.title,
                  text: post.title,
                  url: shareUrl,
                };

                try {
                  if (navigator.share && navigator.canShare?.(shareData)) {
                    await navigator.share(shareData);
                  } else {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success('링크가 복사되었습니다');
                  }
                } catch (error) {
                  if ((error as Error).name !== 'AbortError') {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success('링크가 복사되었습니다');
                  }
                }
              }}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            {!isAuthor && (
              <Button
                variant="ghost"
                size="sm"
                title={!user ? '로그인이 필요합니다' : '신고'}
                onClick={handleReport}
              >
                <Flag className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </article>

      {/* Legal Q&A Answers (법률 Q&A 카테고리에서만 표시) */}
      {post.category === 'LEGAL_QNA' && (
        <QueryErrorBoundary>
          <div className="bg-card border rounded-lg p-6">
            <AnswerList
              postId={postId}
              postAuthorId={post.author?.id || null}
            />
          </div>
        </QueryErrorBoundary>
      )}

      {/* Comments (구인공고, 법률 Q&A 제외) */}
      {post.category !== PostCategory.JOB_POSTING && post.category !== PostCategory.LEGAL_QNA && (
        <QueryErrorBoundary>
          <CommentSection postId={postId} commentCount={post.commentCount} />
        </QueryErrorBoundary>
      )}

      {/* 목록으로 버튼 */}
      <div className="flex justify-center pt-4 pb-8">
        <Button variant="outline" onClick={handleGoToList} className="gap-2">
          <List className="h-4 w-4" />
          목록으로
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="게시글 삭제"
        description="정말 이 게시글을 삭제하시겠습니까? 삭제된 게시글은 복구할 수 없습니다."
        confirmLabel="삭제"
        variant="destructive"
        isLoading={deletePost.isPending}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="POST"
        targetId={postId}
        targetTitle={post.title}
      />
    </div>
  );
}
