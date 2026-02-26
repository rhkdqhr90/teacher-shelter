'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PostEditor } from '@/components/editor';
import { Loader2, Upload, FileText, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useCreatePost, useUpdatePost, usePost } from '../hooks/use-posts';
import { useUploadMaterial } from '@/features/uploads/hooks/use-uploads';
import {
  PostCategory,
  POST_CATEGORY_LABELS,
  COMMUNITY_CATEGORIES,
  INFO_CATEGORIES,
  TEACHING_LIFE_CATEGORIES,
  createPostSchema,
  updatePostSchema,
  JobSubCategory,
  JOB_SUB_CATEGORY_LABELS,
  Region,
  REGION_LABELS,
  SalaryType,
  SALARY_TYPE_LABELS,
  EmploymentType,
  EMPLOYMENT_TYPE_LABELS,
  TherapyTag,
  THERAPY_TAG_LABELS,
  AttachmentInput,
} from '../types';

// 카테고리 그룹 설정 (게시글 작성 폼용)
const CATEGORY_GROUPS = [
  {
    label: '커뮤니티',
    categories: COMMUNITY_CATEGORIES,
  },
  {
    label: '정보공유',
    categories: INFO_CATEGORIES,
  },
  {
    label: '교직생활',
    categories: TEACHING_LIFE_CATEGORIES,
  },
  {
    label: '법률/권익',
    categories: [PostCategory.LEGAL_QNA] as const,
  },
  {
    label: '구인',
    categories: [PostCategory.JOB_POSTING] as const,
  },
] as const;
import { useIsAuthenticated, useUser, useAuthStore } from '@/stores/auth-store';
import { Skeleton } from '@/components/ui/skeleton';

interface PostFormProps {
  mode?: 'create' | 'edit';
  postId?: string;
  defaultCategory?: PostCategory;
}

export function PostForm({ mode = 'create', postId, defaultCategory }: PostFormProps) {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const isAuthInitialized = useAuthStore((state) => state.isInitialized);
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const { data: existingPost, isLoading: isLoadingPost } = usePost(postId || '');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>(defaultCategory || PostCategory.FREE);
  const [isAnonymous, setIsAnonymous] = useState(defaultCategory === PostCategory.ANONYMOUS);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(mode === 'create');

  // 구인공고 전용 상태 (기존)
  const [jobSubCategory, setJobSubCategory] = useState<JobSubCategory>(JobSubCategory.DAYCARE);
  const [region, setRegion] = useState<Region>(Region.SEOUL);
  const [salaryType, setSalaryType] = useState<SalaryType>(SalaryType.NEGOTIABLE);
  const [salaryMin, setSalaryMin] = useState<string>('');
  const [salaryMax, setSalaryMax] = useState<string>('');

  // 1순위: 핵심 채용 정보
  const [organizationName, setOrganizationName] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactKakao, setContactKakao] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');
  const [isAutoClose, setIsAutoClose] = useState<boolean>(true);
  const [recruitCount, setRecruitCount] = useState<string>('');
  const [workingHours, setWorkingHours] = useState<string>('');

  // 2순위: 상세 정보
  const [employmentType, setEmploymentType] = useState<EmploymentType | ''>('');
  const [benefits, setBenefits] = useState<string>('');
  const [requirements, setRequirements] = useState<string>('');
  const [detailAddress, setDetailAddress] = useState<string>('');

  // 치료/교육 분야 태그
  const [therapyTags, setTherapyTags] = useState<TherapyTag[]>([]);

  // 수업자료 첨부파일
  const [attachments, setAttachments] = useState<AttachmentInput[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const materialInputRef = useRef<HTMLInputElement>(null);
  const uploadMaterial = useUploadMaterial();

  // 카테고리가 고정되어 있는지 (URL 파라미터로 전달된 경우 또는 수정 모드)
  // 수정 모드에서는 카테고리 변경 불가 (익명→일반 등 악용 방지)
  const isCategoryFixed = (mode === 'create' && !!defaultCategory) || mode === 'edit';

  // 익명 토글 표시 여부 (익명게시판에서만)
  const showAnonymousToggle = category === PostCategory.ANONYMOUS;

  // 구인공고 여부
  const isJobPosting = category === PostCategory.JOB_POSTING;

  // 수업자료 여부
  const isClassMaterial = category === PostCategory.CLASS_MATERIAL;

  // 허용 파일 형식 (수업자료)
  const MATERIAL_ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.hwp';
  const MAX_ATTACHMENTS = 5;
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

  // 파일 업로드 핸들러
  const handleMaterialUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_ATTACHMENTS - attachments.length;
    if (remainingSlots <= 0) {
      setError(`첨부파일은 최대 ${MAX_ATTACHMENTS}개까지 가능합니다.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsUploading(true);
    setError(null);

    try {
      const newAttachments: AttachmentInput[] = [];

      for (const file of filesToUpload) {
        // 파일 크기 검증
        if (file.size > MAX_FILE_SIZE) {
          setError(`${file.name}: 파일 크기가 20MB를 초과합니다.`);
          continue;
        }

        const result = await uploadMaterial.mutateAsync(file);
        newAttachments.push({
          fileUrl: result.fileUrl,
          fileName: result.fileName,
          fileSize: result.fileSize,
          mimeType: result.mimeType,
        });
      }

      setAttachments((prev) => [...prev, ...newAttachments]);
    } catch {
      setError('파일 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
      // input 초기화
      if (materialInputRef.current) {
        materialInputRef.current.value = '';
      }
    }
  };

  // 첨부파일 삭제 핸들러
  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // 파일 크기 포맷
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (mode === 'edit' && existingPost && !isInitialized) {
      setTitle(existingPost.title);
      setContent(existingPost.content);
      setCategory(existingPost.category);
      setIsAnonymous(existingPost.isAnonymous);
      // 구인공고 필드 로드 (기존)
      if (existingPost.jobSubCategory) setJobSubCategory(existingPost.jobSubCategory);
      if (existingPost.region) setRegion(existingPost.region);
      if (existingPost.salaryType) setSalaryType(existingPost.salaryType);
      if (existingPost.salaryMin) setSalaryMin(existingPost.salaryMin.toString());
      if (existingPost.salaryMax) setSalaryMax(existingPost.salaryMax.toString());
      // 1순위: 핵심 채용 정보
      if (existingPost.organizationName) setOrganizationName(existingPost.organizationName);
      if (existingPost.contactPhone) setContactPhone(existingPost.contactPhone);
      if (existingPost.contactEmail) setContactEmail(existingPost.contactEmail);
      if (existingPost.contactKakao) setContactKakao(existingPost.contactKakao);
      if (existingPost.deadline) setDeadline(existingPost.deadline.split('T')[0] || '');
      if (existingPost.isAutoClose !== undefined) setIsAutoClose(existingPost.isAutoClose);
      if (existingPost.recruitCount) setRecruitCount(existingPost.recruitCount.toString());
      if (existingPost.workingHours) setWorkingHours(existingPost.workingHours);
      // 2순위: 상세 정보
      if (existingPost.employmentType) setEmploymentType(existingPost.employmentType);
      if (existingPost.benefits) setBenefits(existingPost.benefits);
      if (existingPost.requirements) setRequirements(existingPost.requirements);
      if (existingPost.detailAddress) setDetailAddress(existingPost.detailAddress);
      // 치료/교육 분야 태그
      if (existingPost.therapyTags) setTherapyTags(existingPost.therapyTags);
      // 첨부파일 로드
      if (existingPost.attachments && existingPost.attachments.length > 0) {
        setAttachments(
          existingPost.attachments.map((att) => ({
            fileUrl: att.fileUrl,
            fileName: att.fileName,
            fileSize: att.fileSize,
            mimeType: att.mimeType,
          }))
        );
      }
      setIsInitialized(true);
    }
  }, [mode, existingPost, isInitialized]);

  const isPending = createPost.isPending || updatePost.isPending || isUploading;
  const isSubmitting = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 중복 제출 방지 (disabled만으로는 빠른 더블클릭을 막지 못함)
    if (isSubmitting.current || isPending) return;
    isSubmitting.current = true;

    setError(null);

    // 기본 데이터
    const formData: Record<string, unknown> = {
      title,
      content,
      category,
    };

    // isAnonymous는 생성 시에만 설정 가능 (수정 시 변경 불가 - 책임 회피 방지)
    if (mode === 'create') {
      formData.isAnonymous = isAnonymous;
    }

    // 구인공고일 경우 추가 필드
    if (category === PostCategory.JOB_POSTING) {
      formData.jobSubCategory = jobSubCategory;
      formData.region = region;
      formData.salaryType = salaryType;
      if (salaryType !== SalaryType.NEGOTIABLE) {
        const minVal = salaryMin ? parseInt(salaryMin, 10) : undefined;
        const maxVal = salaryMax ? parseInt(salaryMax, 10) : undefined;

        // 급여 범위 유효성 검증
        if (minVal !== undefined && maxVal !== undefined && minVal > maxVal) {
          isSubmitting.current = false;
          setError('최소 급여는 최대 급여보다 클 수 없습니다.');
          return;
        }

        if (minVal) formData.salaryMin = minVal;
        if (maxVal) formData.salaryMax = maxVal;
      }
      // 1순위: 핵심 채용 정보
      if (organizationName) formData.organizationName = organizationName;
      if (contactPhone) formData.contactPhone = contactPhone;
      if (contactEmail) formData.contactEmail = contactEmail;
      if (contactKakao) formData.contactKakao = contactKakao;
      if (deadline) formData.deadline = deadline;
      formData.isAutoClose = isAutoClose;
      if (recruitCount) formData.recruitCount = parseInt(recruitCount, 10);
      if (workingHours) formData.workingHours = workingHours;
      // 2순위: 상세 정보
      if (employmentType) formData.employmentType = employmentType;
      if (benefits) formData.benefits = benefits;
      if (requirements) formData.requirements = requirements;
      if (detailAddress) formData.detailAddress = detailAddress;
      // 치료/교육 분야 태그
      if (therapyTags.length > 0) formData.therapyTags = therapyTags;
    }

    // 수업자료일 경우 첨부파일 추가
    if (category === PostCategory.CLASS_MATERIAL && attachments.length > 0) {
      formData.attachments = attachments;
    }

    try {
      if (mode === 'edit' && postId) {
        // 수정용 스키마 사용 - isAnonymous 필드가 포함되지 않음
        const result = updatePostSchema.safeParse(formData);
        if (!result.success) {
          isSubmitting.current = false;
          setError(result.error.errors[0]?.message || '입력을 확인해주세요.');
          return;
        }
        await updatePost.mutateAsync({ id: postId, data: result.data });
        router.push(`/posts/${postId}`);
      } else {
        // 생성용 스키마 사용 - isAnonymous 필드 포함
        const result = createPostSchema.safeParse(formData);
        if (!result.success) {
          isSubmitting.current = false;
          setError(result.error.errors[0]?.message || '입력을 확인해주세요.');
          return;
        }
        const newPost = await createPost.mutateAsync(result.data);
        router.push(`/posts/${newPost.id}`);
      }
      // 성공 시에도 리셋 (페이지 이동 실패 또는 뒤로가기 대비)
      isSubmitting.current = false;
    } catch {
      isSubmitting.current = false;
      setError(mode === 'edit' ? '게시글 수정에 실패했습니다. 다시 시도해주세요.' : '게시글 작성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 인증 상태 초기화 중이거나 수정 모드에서 게시글 로딩 중
  if (!isAuthInitialized || (mode === 'edit' && isLoadingPost)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  // 로그인 필요 (인증 초기화 완료 후에만 체크)
  // 수정 모드에서는 이미 게시글을 로드했으므로 인증 상태 변동에 의한 깜빡임 방지
  // (백그라운드 API 호출 실패로 인한 일시적 인증 해제 시 UI 유지)
  // 실제 권한 검증은 submit 시 백엔드에서 수행
  if (!isAuthenticated && mode === 'create') {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-lg text-foreground-muted">
          글을 작성하려면 로그인이 필요합니다.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/">홈으로</Link>
          </Button>
          <Button asChild>
            <Link href="/login?callbackUrl=/posts/new">로그인하기</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 이메일 인증 필요 (수정 모드에서는 이미 권한이 있으므로 건너뛰기)
  if (user && !user.isVerified && mode === 'create') {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-lg text-foreground-muted">
          글을 작성하려면 이메일 인증이 필요합니다.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/">홈으로</Link>
          </Button>
          <Button asChild>
            <Link href="/register">이메일 인증하기</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Category Select */}
      <div>
        <label className="block text-sm font-medium mb-2">카테고리</label>
        {isCategoryFixed ? (
          // 카테고리 고정 시 표시만
          <div className="inline-flex px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground">
            {POST_CATEGORY_LABELS[category]}
          </div>
        ) : (
          // 카테고리 선택 가능 (그룹화)
          <div className="space-y-4">
            {CATEGORY_GROUPS.map((group) => (
              <div key={group.label}>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2 block">
                  {group.label}
                </span>
                <div className="flex flex-wrap gap-2">
                  {group.categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCategory(cat);
                        // 익명게시판 선택 시 자동으로 익명 설정
                        if (cat === PostCategory.ANONYMOUS) {
                          setIsAnonymous(true);
                        } else {
                          setIsAnonymous(false);
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        category === cat
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {POST_CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Anonymous Toggle - 익명게시판에서만 표시 */}
      {showAnonymousToggle && (
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
          <span className="text-sm font-medium">
            익명으로 작성
            <span className="text-muted-foreground ml-2 text-xs">
              (닉네임 대신 &apos;익명&apos;으로 표시됩니다)
            </span>
          </span>
        </div>
      )}

      {/* 구인공고 전용 필드 */}
      {isJobPosting && (
        <div className="space-y-6">
          {/* 기본 구인 정보 */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="font-medium text-sm text-foreground">기본 정보</h3>

            {/* 하위 카테고리 */}
            <div>
              <label className="block text-sm font-medium mb-2">분류 *</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(JOB_SUB_CATEGORY_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setJobSubCategory(value as JobSubCategory)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      jobSubCategory === value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 기관명 */}
            <div>
              <label className="block text-sm font-medium mb-2">기관/회사명</label>
              <Input
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="예: OO어린이집, OO유치원"
                maxLength={100}
              />
            </div>

            {/* 지역 + 상세주소 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">지역 *</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as Region)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {Object.entries(REGION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">상세 주소</label>
                <Input
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                  placeholder="예: 강남구 테헤란로 123"
                  maxLength={200}
                />
              </div>
            </div>
          </div>

          {/* 근무 조건 */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="font-medium text-sm text-foreground">근무 조건</h3>

            {/* 근무 형태 */}
            <div>
              <label className="block text-sm font-medium mb-2">근무 형태</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setEmploymentType(employmentType === value ? '' : value as EmploymentType)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      employmentType === value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 급여 정보 */}
            <div>
              <label className="block text-sm font-medium mb-2">급여</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(SALARY_TYPE_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSalaryType(value as SalaryType)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      salaryType === value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* 급여 금액 입력 (협의가 아닐 때만) */}
              {salaryType !== SalaryType.NEGOTIABLE && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="최소"
                    className="w-32"
                    min={0}
                  />
                  <span className="text-muted-foreground">~</span>
                  <Input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="최대"
                    className="w-32"
                    min={0}
                  />
                  <span className="text-sm text-muted-foreground">
                    {salaryType === SalaryType.MONTHLY ? '만원' : '원'}
                  </span>
                </div>
              )}
            </div>

            {/* 근무 시간 */}
            <div>
              <label className="block text-sm font-medium mb-2">근무 시간</label>
              <Input
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="예: 09:00~18:00 (주 5일)"
                maxLength={50}
              />
            </div>
          </div>

          {/* 모집 정보 */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="font-medium text-sm text-foreground">모집 정보</h3>

            {/* 모집 인원 + 마감일 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">모집 인원</label>
                <Input
                  type="number"
                  value={recruitCount}
                  onChange={(e) => setRecruitCount(e.target.value)}
                  placeholder="예: 1"
                  min={1}
                  max={1000}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">채용 마감일</label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* 자동 마감 */}
            {deadline && (
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAutoClose}
                    onChange={(e) => setIsAutoClose(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <span className="text-sm">
                  마감일에 자동으로 모집 종료
                </span>
              </div>
            )}

            {/* 요구 자격 */}
            <div>
              <label className="block text-sm font-medium mb-2">요구 자격/조건</label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="예: 유치원 정교사 2급 이상, 경력 2년 이상"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-y"
                maxLength={2000}
              />
            </div>

            {/* 복리후생 */}
            <div>
              <label className="block text-sm font-medium mb-2">복리후생</label>
              <textarea
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                placeholder="예: 4대보험, 퇴직금, 식대 지원, 교통비 지원"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-y"
                maxLength={2000}
              />
            </div>
          </div>

          {/* 치료/교육 분야 태그 */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="font-medium text-sm text-foreground">
              치료/교육 분야{' '}
              <span className="text-xs text-muted-foreground font-normal">(다중 선택 가능)</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(THERAPY_TAG_LABELS).map(([value, label]) => {
                const isSelected = therapyTags.includes(value as TherapyTag);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setTherapyTags(therapyTags.filter((t) => t !== value));
                      } else {
                        if (therapyTags.length < 8) {
                          setTherapyTags([...therapyTags, value as TherapyTag]);
                        }
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-orange-500 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {therapyTags.length > 0 && (
              <p className="text-xs text-muted-foreground">
                선택된 분야: {therapyTags.length}개 / 최대 8개
              </p>
            )}
          </div>

          {/* 연락처 정보 */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="font-medium text-sm text-foreground">연락처</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">전화번호</label>
                <Input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  maxLength={20}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">이메일</label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">카카오톡 ID</label>
                <Input
                  value={contactKakao}
                  onChange={(e) => setContactKakao(e.target.value)}
                  placeholder="카카오톡 ID"
                  maxLength={50}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              * 연락처 중 하나 이상 입력하시면 지원자가 연락할 수 있습니다.
            </p>
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          제목
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          maxLength={200}
        />
      </div>

      {/* 수업자료 첨부파일 */}
      {isClassMaterial && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm text-foreground">
              첨부파일{' '}
              <span className="text-xs text-muted-foreground font-normal">
                (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, HWP / 최대 20MB, {MAX_ATTACHMENTS}개)
              </span>
            </h3>
            <span className="text-xs text-muted-foreground">
              {attachments.length} / {MAX_ATTACHMENTS}
            </span>
          </div>

          {/* 업로드 버튼 */}
          <div>
            <input
              ref={materialInputRef}
              type="file"
              accept={MATERIAL_ACCEPT}
              multiple
              onChange={handleMaterialUpload}
              className="hidden"
              id="material-upload"
            />
            <label
              htmlFor="material-upload"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                attachments.length >= MAX_ATTACHMENTS || isUploading
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  업로드 중...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  파일 선택
                </>
              )}
            </label>
          </div>

          {/* 첨부파일 목록 */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-background rounded-md border"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.fileSize)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(index)}
                    className="p-1 rounded-md hover:bg-muted transition-colors shrink-0"
                    title="삭제"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div>
        <label className="block text-sm font-medium mb-2">내용</label>
        <PostEditor
          key={isInitialized ? 'initialized' : 'loading'}
          content={content}
          onChange={setContent}
          placeholder="내용을 입력하세요"
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
        >
          취소
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="flex-1"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {mode === 'edit' ? '수정 중...' : '작성 중...'}
            </>
          ) : (
            mode === 'edit' ? '수정하기' : '작성하기'
          )}
        </Button>
      </div>
    </form>
  );
}
