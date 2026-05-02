import { Metadata } from 'next';
import { PostsContent } from './posts-content';

const CATEGORY_SEO: Record<string, { title: string; h1: string; description: string }> = {
  FREE: {
    title: '자유게시판',
    h1: '교사 자유게시판',
    description: '특수교사, 보육교사, 유치원교사들의 자유 게시판. 교사 일상, 고민, 이야기를 자유롭게 나누세요.',
  },
  ANONYMOUS: {
    title: '교사 익명게시판',
    h1: '교사 익명게시판',
    description: '익명으로 편하게 고민을 털어놓을 수 있는 교사 전용 게시판.',
  },
  HUMOR: {
    title: '교사 유머 게시판',
    h1: '교사 유머 게시판',
    description: '선생님들의 유머, 웃픈 교단 이야기를 공유하는 게시판.',
  },
  INFO: {
    title: '교사 정보공유 게시판',
    h1: '교사 정보공유',
    description: '특수교사, 보육교사, 유치원교사를 위한 교육 정보, 정책 변경, 복지 정보를 공유하는 게시판.',
  },
  KNOWHOW: {
    title: '교사 노하우 공유',
    h1: '교사 노하우 공유',
    description: '현장 교사들의 수업 노하우, 학급 운영 팁, 학부모 대응 노하우를 나누는 게시판.',
  },
  CLASS_MATERIAL: {
    title: '수업자료 공유 게시판',
    h1: '수업자료 공유',
    description: '특수교사, 보육교사, 유치원교사의 수업자료, 활동지, 교구 아이디어를 공유하는 게시판.',
  },
  CERTIFICATION: {
    title: '교사 자격증 게시판',
    h1: '교사 자격증 정보',
    description: '특수교사 2급, 보육교사 자격증 취득 방법, 시험 준비, 승급 정보를 공유하는 게시판.',
  },
  SCHOOL_EVENT: {
    title: '학교행사 게시판',
    h1: '학교행사 아이디어 공유',
    description: '운동회, 발표회, 학급 파티 등 학교·어린이집 행사 아이디어와 후기를 공유하는 게시판.',
  },
  PARENT_COUNSEL: {
    title: '학부모상담 게시판',
    h1: '학부모상담 노하우',
    description: '어려운 학부모 상담, 민원 대처법, 학부모 소통 노하우를 나누는 게시판.',
  },
  TEACHER_DAYCARE: {
    title: '보육교사·어린이집교사 커뮤니티',
    h1: '보육교사·어린이집교사 커뮤니티',
    description: '보육교사, 어린이집 교사를 위한 게시판. 어린이집 운영, 보육 노하우, 영유아 발달, 구인구직 정보를 나누세요.',
  },
  TEACHER_SPECIAL: {
    title: '특수교사 커뮤니티',
    h1: '특수교사 커뮤니티',
    description: '특수교사를 위한 게시판. 특수학교·특수학급 교사들의 수업 노하우, IEP 작성, 장애학생 지도, 행정 고민을 나누세요.',
  },
  TEACHER_KINDERGARTEN: {
    title: '유치원교사 커뮤니티',
    h1: '유치원교사 커뮤니티',
    description: '유치원교사를 위한 게시판. 유아 교육 수업자료, 놀이 중심 교육, 학부모 상담, 유치원 행사 아이디어를 나누세요.',
  },
  LEGAL_QNA: {
    title: '교사 법률·권익 Q&A',
    h1: '교사 법률·권익 Q&A',
    description: '교육 현장의 법률 문제, 교권 침해 대응, 교사 권익 관련 질문과 정보를 나누는 게시판.',
  },
};

interface PostsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({ searchParams }: PostsPageProps): Promise<Metadata> {
  const { category } = await searchParams;
  const seo = category ? CATEGORY_SEO[category] : null;

  if (seo) {
    return {
      title: seo.title,
      description: seo.description,
      // 익명게시판은 개인정보·명예훼손 위험으로 noindex (개별 게시글과 동일 정책)
      ...(category === 'ANONYMOUS' && { robots: { index: false, follow: false } }),
      openGraph: {
        title: `${seo.title} | 교사쉼터`,
        description: seo.description,
        type: 'website',
      },
    };
  }

  return {
    title: '교사 커뮤니티 게시판',
    description: '특수교사, 보육교사, 어린이집 교사, 유치원교사를 위한 커뮤니티 게시판. 자유게시판, 정보공유, 노하우, 구인구직.',
    openGraph: {
      title: '교사 커뮤니티 게시판 | 교사쉼터',
      description: '특수교사, 보육교사, 어린이집 교사, 유치원교사를 위한 커뮤니티 게시판.',
      type: 'website',
    },
  };
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const { category } = await searchParams;
  const seo = category ? CATEGORY_SEO[category] : null;

  const h1 = seo?.h1 ?? '교사 커뮤니티 게시판';
  const description =
    seo?.description ??
    '특수교사, 보육교사, 어린이집 교사, 유치원교사를 위한 커뮤니티. 자유게시판, 정보공유, 구인구직.';

  return (
    <PostsContent>
      <section className="mb-4 pb-3 border-b border-border" aria-label="게시판 소개">
        <h1 className="text-lg font-semibold text-foreground">{h1}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </section>
    </PostsContent>
  );
}
