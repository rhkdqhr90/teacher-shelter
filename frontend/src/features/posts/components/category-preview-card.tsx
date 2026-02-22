'use client';

import { memo } from 'react';
import Link from 'next/link';
import {
  Coffee,
  MessageCircle,
  Lightbulb,
  Info,
  Scale,
  ChevronRight,
  Loader2,
  Laugh,
  Briefcase,
  BookOpen,
  Award,
  Calendar,
  Users,
  Baby,
  Heart,
  School,
} from 'lucide-react';
import { useCategoryPreviews } from '../hooks/use-posts';
import { PostCategory, type Post } from '../types';

type PostPreview = Pick<Post, 'id' | 'title' | 'commentCount'>;

export const CATEGORY_CONFIG: Record<
  PostCategory,
  {
    label: string;
    icon: React.ReactNode;
    href: string;
    description: string;
  }
> = {
  // 커뮤니티 그룹
  [PostCategory.FREE]: {
    label: '자유게시판',
    icon: <Coffee className="w-5 h-5" />,
    href: '/posts?category=FREE',
    description: '일상 이야기를 나눠요',
  },
  [PostCategory.ANONYMOUS]: {
    label: '익명고민',
    icon: <MessageCircle className="w-5 h-5" />,
    href: '/posts?category=ANONYMOUS',
    description: '익명으로 고민을 나눠요',
  },
  [PostCategory.HUMOR]: {
    label: '유머',
    icon: <Laugh className="w-5 h-5" />,
    href: '/posts?category=HUMOR',
    description: '웃긴 이야기를 나눠요',
  },
  // 정보공유 그룹
  [PostCategory.INFO]: {
    label: '정보공유',
    icon: <Info className="w-5 h-5" />,
    href: '/posts?category=INFO',
    description: '유용한 정보를 나눠요',
  },
  [PostCategory.KNOWHOW]: {
    label: '노하우',
    icon: <Lightbulb className="w-5 h-5" />,
    href: '/posts?category=KNOWHOW',
    description: '경험과 팁을 공유해요',
  },
  [PostCategory.CLASS_MATERIAL]: {
    label: '수업자료',
    icon: <BookOpen className="w-5 h-5" />,
    href: '/posts?category=CLASS_MATERIAL',
    description: '수업에 필요한 자료 공유',
  },
  [PostCategory.CERTIFICATION]: {
    label: '자격증',
    icon: <Award className="w-5 h-5" />,
    href: '/posts?category=CERTIFICATION',
    description: '자격증 정보와 취득 후기',
  },
  // 교직생활 그룹
  [PostCategory.SCHOOL_EVENT]: {
    label: '학교행사',
    icon: <Calendar className="w-5 h-5" />,
    href: '/posts?category=SCHOOL_EVENT',
    description: '행사 기획과 운영 노하우',
  },
  [PostCategory.PARENT_COUNSEL]: {
    label: '학부모상담',
    icon: <Users className="w-5 h-5" />,
    href: '/posts?category=PARENT_COUNSEL',
    description: '상담 팁과 사례 공유',
  },
  [PostCategory.TEACHER_DAYCARE]: {
    label: '보육교사',
    icon: <Baby className="w-5 h-5" />,
    href: '/posts?category=TEACHER_DAYCARE',
    description: '보육교사 전용 커뮤니티',
  },
  [PostCategory.TEACHER_SPECIAL]: {
    label: '특수교사',
    icon: <Heart className="w-5 h-5" />,
    href: '/posts?category=TEACHER_SPECIAL',
    description: '특수교사 전용 커뮤니티',
  },
  [PostCategory.TEACHER_KINDERGARTEN]: {
    label: '유치원교사',
    icon: <School className="w-5 h-5" />,
    href: '/posts?category=TEACHER_KINDERGARTEN',
    description: '유치원교사 전용 커뮤니티',
  },
  // 법률/권익
  [PostCategory.LEGAL_QNA]: {
    label: '법률Q&A',
    icon: <Scale className="w-5 h-5" />,
    href: '/posts?category=LEGAL_QNA',
    description: '법률 관련 질문과 답변',
  },
  // 구인
  [PostCategory.JOB_POSTING]: {
    label: '구인공고',
    icon: <Briefcase className="w-5 h-5" />,
    href: '/jobs',
    description: '교육 관련 채용 정보',
  },
};

export const CategoryPreviewCard = memo(function CategoryPreviewCard({
  category,
}: {
  category: PostCategory;
}) {
  const config = CATEGORY_CONFIG[category];
  const { data: previews, isLoading } = useCategoryPreviews();
  const posts: PostPreview[] = previews?.[category] || [];

  return (
    <section className="category-preview">
      <Link href={config.href} className="category-preview__header">
        <div className="category-preview__title-wrap">
          <span className="category-preview__icon">{config.icon}</span>
          <h3 className="category-preview__title">{config.label}</h3>
        </div>
        <ChevronRight
          className="w-4 h-4 text-foreground-muted"
          aria-hidden="true"
        />
      </Link>

      <div className="category-preview__list">
        {isLoading ? (
          <div className="category-preview__loading">
            <Loader2 className="h-4 w-4 animate-spin" aria-label="로딩 중" />
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="category-preview__item"
            >
              <span className="category-preview__item-title">{post.title}</span>
              {post.commentCount > 0 && (
                <span className="category-preview__item-comments">
                  [{post.commentCount}]
                </span>
              )}
            </Link>
          ))
        ) : (
          <p className="category-preview__empty">아직 게시글이 없어요</p>
        )}
      </div>
    </section>
  );
});
