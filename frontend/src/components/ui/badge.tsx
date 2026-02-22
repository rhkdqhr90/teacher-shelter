import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary/10 text-secondary',
        destructive: 'bg-destructive/10 text-destructive',
        outline: 'border border-border text-foreground',
        // 커뮤니티 카테고리
        free: 'badge-free',
        anonymous: 'badge-anonymous',
        humor: 'badge-humor',
        // 정보공유 카테고리
        info: 'badge-info',
        knowhow: 'badge-knowhow',
        classMaterial: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        certification: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        // 교직생활 카테고리
        schoolEvent: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        parentCounsel: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        teacherDaycare: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
        teacherSpecial: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        teacherKindergarten: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
        // 법률/구인
        legal: 'badge-legal',
        job: 'badge-job',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// 카테고리 enum을 배지 variant로 매핑
export type PostCategory =
  | 'FREE'
  | 'ANONYMOUS'
  | 'HUMOR'
  | 'INFO'
  | 'KNOWHOW'
  | 'CLASS_MATERIAL'
  | 'CERTIFICATION'
  | 'SCHOOL_EVENT'
  | 'PARENT_COUNSEL'
  | 'TEACHER_DAYCARE'
  | 'TEACHER_SPECIAL'
  | 'TEACHER_KINDERGARTEN'
  | 'LEGAL_QNA'
  | 'JOB_POSTING';

const categoryVariantMap: Record<PostCategory, BadgeProps['variant']> = {
  // 커뮤니티
  FREE: 'free',
  ANONYMOUS: 'anonymous',
  HUMOR: 'humor',
  // 정보공유
  INFO: 'info',
  KNOWHOW: 'knowhow',
  CLASS_MATERIAL: 'classMaterial',
  CERTIFICATION: 'certification',
  // 교직생활
  SCHOOL_EVENT: 'schoolEvent',
  PARENT_COUNSEL: 'parentCounsel',
  TEACHER_DAYCARE: 'teacherDaycare',
  TEACHER_SPECIAL: 'teacherSpecial',
  TEACHER_KINDERGARTEN: 'teacherKindergarten',
  // 법률/구인
  LEGAL_QNA: 'legal',
  JOB_POSTING: 'job',
};

const categoryLabelMap: Record<PostCategory, string> = {
  FREE: '자유',
  ANONYMOUS: '익명',
  HUMOR: '유머',
  INFO: '정보',
  KNOWHOW: '노하우',
  CLASS_MATERIAL: '수업자료',
  CERTIFICATION: '자격증',
  SCHOOL_EVENT: '학교행사',
  PARENT_COUNSEL: '학부모상담',
  TEACHER_DAYCARE: '보육교사',
  TEACHER_SPECIAL: '특수교사',
  TEACHER_KINDERGARTEN: '유치원교사',
  LEGAL_QNA: '법률Q&A',
  JOB_POSTING: '구인',
};

export function CategoryBadge({ category }: { category: PostCategory }) {
  return (
    <Badge variant={categoryVariantMap[category]}>
      {categoryLabelMap[category]}
    </Badge>
  );
}
