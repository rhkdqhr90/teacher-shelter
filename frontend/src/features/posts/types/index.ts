import { z } from 'zod';
import type { PaginatedResponse } from '@/lib/api-client';

export enum PostCategory {
  // 커뮤니티 그룹
  FREE = 'FREE',
  ANONYMOUS = 'ANONYMOUS',
  HUMOR = 'HUMOR',
  // 정보공유 그룹
  INFO = 'INFO',
  KNOWHOW = 'KNOWHOW',
  CLASS_MATERIAL = 'CLASS_MATERIAL',
  CERTIFICATION = 'CERTIFICATION',
  // 교직생활 그룹
  SCHOOL_EVENT = 'SCHOOL_EVENT',
  PARENT_COUNSEL = 'PARENT_COUNSEL',
  TEACHER_DAYCARE = 'TEACHER_DAYCARE',
  TEACHER_SPECIAL = 'TEACHER_SPECIAL',
  TEACHER_KINDERGARTEN = 'TEACHER_KINDERGARTEN',
  // 법률/권익
  LEGAL_QNA = 'LEGAL_QNA',
  // 구인
  JOB_POSTING = 'JOB_POSTING',
}

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  [PostCategory.FREE]: '자유',
  [PostCategory.ANONYMOUS]: '익명',
  [PostCategory.HUMOR]: '유머',
  [PostCategory.INFO]: '정보',
  [PostCategory.KNOWHOW]: '노하우',
  [PostCategory.CLASS_MATERIAL]: '수업자료',
  [PostCategory.CERTIFICATION]: '자격증',
  [PostCategory.SCHOOL_EVENT]: '학교행사',
  [PostCategory.PARENT_COUNSEL]: '학부모상담',
  [PostCategory.TEACHER_DAYCARE]: '보육교사',
  [PostCategory.TEACHER_SPECIAL]: '특수교사',
  [PostCategory.TEACHER_KINDERGARTEN]: '유치원교사',
  [PostCategory.LEGAL_QNA]: '법률Q&A',
  [PostCategory.JOB_POSTING]: '구인공고',
};

// 커뮤니티 드롭다운에 포함되는 카테고리
export const COMMUNITY_CATEGORIES = [
  PostCategory.FREE,
  PostCategory.ANONYMOUS,
  PostCategory.HUMOR,
] as const;

// 정보공유 드롭다운에 포함되는 카테고리
export const INFO_CATEGORIES = [
  PostCategory.INFO,
  PostCategory.KNOWHOW,
  PostCategory.CLASS_MATERIAL,
  PostCategory.CERTIFICATION,
] as const;

// 교직생활 드롭다운에 포함되는 카테고리
export const TEACHING_LIFE_CATEGORIES = [
  PostCategory.SCHOOL_EVENT,
  PostCategory.PARENT_COUNSEL,
  PostCategory.TEACHER_DAYCARE,
  PostCategory.TEACHER_SPECIAL,
  PostCategory.TEACHER_KINDERGARTEN,
] as const;

// 구인공고 하위 카테고리
export enum JobSubCategory {
  DAYCARE = 'DAYCARE',
  KINDERGARTEN = 'KINDERGARTEN',
  SPECIAL_ED = 'SPECIAL_ED',
  HOME_TUTOR = 'HOME_TUTOR',
  ACADEMY = 'ACADEMY',
  OTHER = 'OTHER',
}

export const JOB_SUB_CATEGORY_LABELS: Record<JobSubCategory, string> = {
  [JobSubCategory.DAYCARE]: '어린이집',
  [JobSubCategory.KINDERGARTEN]: '유치원',
  [JobSubCategory.SPECIAL_ED]: '특수교사',
  [JobSubCategory.HOME_TUTOR]: '홈티(방문교사)',
  [JobSubCategory.ACADEMY]: '학원',
  [JobSubCategory.OTHER]: '기타',
};

// 지역
export enum Region {
  SEOUL = 'SEOUL',
  BUSAN = 'BUSAN',
  DAEGU = 'DAEGU',
  INCHEON = 'INCHEON',
  GWANGJU = 'GWANGJU',
  DAEJEON = 'DAEJEON',
  ULSAN = 'ULSAN',
  SEJONG = 'SEJONG',
  GYEONGGI = 'GYEONGGI',
  GANGWON = 'GANGWON',
  CHUNGBUK = 'CHUNGBUK',
  CHUNGNAM = 'CHUNGNAM',
  JEONBUK = 'JEONBUK',
  JEONNAM = 'JEONNAM',
  GYEONGBUK = 'GYEONGBUK',
  GYEONGNAM = 'GYEONGNAM',
  JEJU = 'JEJU',
}

export const REGION_LABELS: Record<Region, string> = {
  [Region.SEOUL]: '서울',
  [Region.BUSAN]: '부산',
  [Region.DAEGU]: '대구',
  [Region.INCHEON]: '인천',
  [Region.GWANGJU]: '광주',
  [Region.DAEJEON]: '대전',
  [Region.ULSAN]: '울산',
  [Region.SEJONG]: '세종',
  [Region.GYEONGGI]: '경기',
  [Region.GANGWON]: '강원',
  [Region.CHUNGBUK]: '충북',
  [Region.CHUNGNAM]: '충남',
  [Region.JEONBUK]: '전북',
  [Region.JEONNAM]: '전남',
  [Region.GYEONGBUK]: '경북',
  [Region.GYEONGNAM]: '경남',
  [Region.JEJU]: '제주',
};

// 급여 타입
export enum SalaryType {
  MONTHLY = 'MONTHLY',
  HOURLY = 'HOURLY',
  NEGOTIABLE = 'NEGOTIABLE',
}

export const SALARY_TYPE_LABELS: Record<SalaryType, string> = {
  [SalaryType.MONTHLY]: '월급',
  [SalaryType.HOURLY]: '시급',
  [SalaryType.NEGOTIABLE]: '협의',
};

// 근무 형태
export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
}

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  [EmploymentType.FULL_TIME]: '정규직',
  [EmploymentType.PART_TIME]: '파트타임',
  [EmploymentType.CONTRACT]: '계약직',
  [EmploymentType.INTERN]: '인턴',
};

// 치료/교육 분야 태그
export enum TherapyTag {
  LANGUAGE = 'LANGUAGE',
  COGNITIVE = 'COGNITIVE',
  LEARNING = 'LEARNING',
  PLAY = 'PLAY',
  SENSORY = 'SENSORY',
  MOTOR = 'MOTOR',
  ART = 'ART',
  MUSIC = 'MUSIC',
}

export const THERAPY_TAG_LABELS: Record<TherapyTag, string> = {
  [TherapyTag.LANGUAGE]: '언어치료',
  [TherapyTag.COGNITIVE]: '인지학습',
  [TherapyTag.LEARNING]: '학습지도',
  [TherapyTag.PLAY]: '놀이치료',
  [TherapyTag.SENSORY]: '감각통합',
  [TherapyTag.MOTOR]: '운동치료',
  [TherapyTag.ART]: '미술치료',
  [TherapyTag.MUSIC]: '음악치료',
};

// 첨부파일 타입
export interface PostAttachment {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  downloadCount: number;
}

// 첨부파일 입력 타입
export interface AttachmentInput {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  isAnonymous: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  author: {
    id: string;
    nickname: string;
    jobType?: string;
    career?: number;
    isVerified: boolean;
    profileImage?: string | null;
  } | null;
  // 구인공고 전용 필드 (기존)
  jobSubCategory?: JobSubCategory | null;
  region?: Region | null;
  salaryType?: SalaryType | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  isRecruiting?: boolean;
  // 1순위: 핵심 채용 정보
  organizationName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  contactKakao?: string | null;
  deadline?: string | null;
  isAutoClose?: boolean;
  recruitCount?: number | null;
  workingHours?: string | null;
  // 2순위: 상세 정보
  employmentType?: EmploymentType | null;
  benefits?: string | null;
  requirements?: string | null;
  detailAddress?: string | null;
  // 치료/교육 분야 태그
  therapyTags?: TherapyTag[];
  // 첨부파일 (수업자료 등)
  attachments?: PostAttachment[];
  createdAt: string;
  updatedAt: string;
}

export type PostsResponse = PaginatedResponse<Post>;

// 첨부파일 입력 스키마 (백엔드 검증과 일치)
const attachmentInputSchema = z.object({
  fileUrl: z
    .string()
    .regex(
      /^\/uploads\/material\/[a-zA-Z0-9_-]+\.(pdf|doc|docx|ppt|pptx|xls|xlsx|hwp)$/i,
      '유효하지 않은 파일 경로입니다'
    ),
  fileName: z.string().max(255),
  fileSize: z.number().min(1).max(20 * 1024 * 1024), // 20MB
  mimeType: z.string(),
});

export const createPostSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이내로 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요').max(10000, '내용은 10000자 이내로 입력해주세요'),
  category: z.nativeEnum(PostCategory),
  isAnonymous: z.boolean().default(false),
  // 구인공고 전용 필드 (기존)
  jobSubCategory: z.nativeEnum(JobSubCategory).optional(),
  region: z.nativeEnum(Region).optional(),
  salaryType: z.nativeEnum(SalaryType).optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  isRecruiting: z.boolean().optional(),
  // 1순위: 핵심 채용 정보
  organizationName: z.string().max(100).optional(),
  contactPhone: z.string().max(20).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactKakao: z.string().max(50).optional(),
  deadline: z.string().optional(),
  isAutoClose: z.boolean().optional(),
  recruitCount: z.number().min(1).max(1000).optional(),
  workingHours: z.string().max(50).optional(),
  // 2순위: 상세 정보
  employmentType: z.nativeEnum(EmploymentType).optional(),
  benefits: z.string().max(2000).optional(),
  requirements: z.string().max(2000).optional(),
  detailAddress: z.string().max(200).optional(),
  // 치료/교육 분야 태그
  therapyTags: z.array(z.nativeEnum(TherapyTag)).max(8).optional(),
  // 첨부파일 (수업자료 전용)
  attachments: z.array(attachmentInputSchema).max(5).optional(),
});

// 수정용 스키마 - isAnonymous 제외 (백엔드 UpdatePostDto와 일치)
// 익명 설정은 생성 시에만 가능하며 수정 불가 (책임 회피 방지)
// .partial()로 모든 필드를 optional로 변환 (부분 업데이트 지원)
export const updatePostSchema = createPostSchema.omit({ isAnonymous: true }).partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
