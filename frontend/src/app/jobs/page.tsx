import { Metadata } from 'next';
import { JobsContent } from './jobs-content';

const JOB_SUB_CATEGORY_SEO: Record<string, { label: string; description: string }> = {
  DAYCARE: {
    label: '어린이집',
    description: '어린이집 보육교사, 보조교사 구인공고. 어린이집 채용 정보를 확인하세요.',
  },
  KINDERGARTEN: {
    label: '유치원',
    description: '유치원 교사 구인공고. 유치원 담임교사, 방과후 교사 채용 정보를 확인하세요.',
  },
  SPECIAL_ED: {
    label: '특수교사',
    description: '특수교사, 특수학교·특수학급 교사 구인공고. 특수교육 채용 정보를 확인하세요.',
  },
  HOME_TUTOR: {
    label: '홈티(방문교사)',
    description: '홈티 방문교사 구인공고. 아동 방문 교육, 가정방문 교사 채용 정보를 확인하세요.',
  },
  ACADEMY: {
    label: '학원',
    description: '학원 강사, 교사 구인공고. 아동 교육 학원 채용 정보를 확인하세요.',
  },
  OTHER: {
    label: '기타',
    description: '교육 관련 기타 직종 구인공고. 다양한 교사·치료사 채용 정보를 확인하세요.',
  },
};

const REGION_SEO: Record<string, string> = {
  SEOUL: '서울',
  BUSAN: '부산',
  DAEGU: '대구',
  INCHEON: '인천',
  GWANGJU: '광주',
  DAEJEON: '대전',
  ULSAN: '울산',
  SEJONG: '세종',
  GYEONGGI: '경기',
  GANGWON: '강원',
  CHUNGBUK: '충북',
  CHUNGNAM: '충남',
  JEONBUK: '전북',
  JEONNAM: '전남',
  GYEONGBUK: '경북',
  GYEONGNAM: '경남',
  JEJU: '제주',
};

interface JobsPageProps {
  searchParams: Promise<{ jobSubCategory?: string; region?: string }>;
}

export async function generateMetadata({ searchParams }: JobsPageProps): Promise<Metadata> {
  const { jobSubCategory, region } = await searchParams;

  const subCatSeo = jobSubCategory ? JOB_SUB_CATEGORY_SEO[jobSubCategory] : null;
  const regionLabel = region ? REGION_SEO[region] : null;

  let title: string;
  let description: string;

  if (subCatSeo && regionLabel) {
    title = `${regionLabel} ${subCatSeo.label} 구인공고`;
    description = `${regionLabel} ${subCatSeo.label} 채용 정보. ${subCatSeo.description}`;
  } else if (subCatSeo) {
    title = `${subCatSeo.label} 구인공고`;
    description = subCatSeo.description;
  } else if (regionLabel) {
    title = `${regionLabel} 교사·치료사 구인공고`;
    description = `${regionLabel} 지역 특수교사, 보육교사, 어린이집 교사, 유치원교사 구인공고. 교사쉼터에서 채용 정보를 확인하세요.`;
  } else {
    title = '교사·치료사 구인공고';
    description =
      '특수교사, 보육교사, 어린이집 교사, 유치원교사, 방문교사 구인공고. 교사·치료사 채용 정보를 교사쉼터에서 확인하세요.';
  }

  return {
    title,
    description,
    openGraph: {
      title: `${title} | 교사쉼터`,
      description,
      type: 'website',
    },
  };
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const { jobSubCategory, region } = await searchParams;

  const subCatSeo = jobSubCategory ? JOB_SUB_CATEGORY_SEO[jobSubCategory] : null;
  const regionLabel = region ? REGION_SEO[region] : null;

  let h1: string;
  let description: string;

  if (subCatSeo && regionLabel) {
    h1 = `${regionLabel} ${subCatSeo.label} 구인공고`;
    description = `${regionLabel} 지역 ${subCatSeo.label} 채용 정보를 확인하세요.`;
  } else if (subCatSeo) {
    h1 = `${subCatSeo.label} 구인공고`;
    description = subCatSeo.description;
  } else if (regionLabel) {
    h1 = `${regionLabel} 교사·치료사 구인공고`;
    description = `${regionLabel} 지역 특수교사, 보육교사, 어린이집 교사, 유치원교사 채용 정보를 확인하세요.`;
  } else {
    h1 = '교사·치료사 구인공고';
    description =
      '특수교사, 보육교사, 어린이집 교사, 유치원교사, 방문교사 구인공고를 확인하세요.';
  }

  return (
    <JobsContent>
      <section className="mb-4 pb-3 border-b border-border" aria-label="구인공고 소개">
        <h1 className="text-lg font-semibold text-foreground">{h1}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </section>
    </JobsContent>
  );
}
