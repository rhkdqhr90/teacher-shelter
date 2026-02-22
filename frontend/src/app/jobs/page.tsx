'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MapPin, Banknote, Eye, ChevronDown, Plus, Building2, Calendar, Clock, Users } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePosts } from '@/features/posts/hooks/use-posts';
import { useIsAuthenticated } from '@/stores/auth-store';
import {
  PostCategory,
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
  type Post,
} from '@/features/posts/types';

const ALL_REGIONS = Object.entries(REGION_LABELS);
const ALL_JOB_SUB_CATEGORIES = Object.entries(JOB_SUB_CATEGORY_LABELS);
const ALL_THERAPY_TAGS = Object.entries(THERAPY_TAG_LABELS);

function formatSalary(post: Post): string {
  if (!post.salaryType) return '협의';
  if (post.salaryType === SalaryType.NEGOTIABLE) return '협의';

  const typeLabel = post.salaryType === SalaryType.MONTHLY ? '월' : '시급';
  const unit = post.salaryType === SalaryType.MONTHLY ? '만원' : '원';

  if (post.salaryMin && post.salaryMax) {
    if (post.salaryMin === post.salaryMax) {
      return `${typeLabel} ${post.salaryMin.toLocaleString()}${unit}`;
    }
    return `${typeLabel} ${post.salaryMin.toLocaleString()}~${post.salaryMax.toLocaleString()}${unit}`;
  }
  if (post.salaryMin) return `${typeLabel} ${post.salaryMin.toLocaleString()}${unit}~`;
  if (post.salaryMax) return `${typeLabel} ~${post.salaryMax.toLocaleString()}${unit}`;
  return '협의';
}

export default function JobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useIsAuthenticated();

  const [regionOpen, setRegionOpen] = useState(false);
  const [therapyTagOpen, setTherapyTagOpen] = useState(false);

  const jobSubCategory = searchParams.get('jobSubCategory') as JobSubCategory | null;
  const region = searchParams.get('region') as Region | null;
  const isRecruiting = searchParams.get('isRecruiting');
  const therapyTagsParam = searchParams.get('therapyTags');
  const selectedTherapyTags = therapyTagsParam ? therapyTagsParam.split(',') as TherapyTag[] : [];

  const { data, isLoading, error } = usePosts({
    category: PostCategory.JOB_POSTING,
    jobSubCategory: jobSubCategory || undefined,
    region: region || undefined,
    isRecruiting: isRecruiting === 'true' ? true : isRecruiting === 'false' ? false : undefined,
    therapyTags: selectedTherapyTags.length > 0 ? selectedTherapyTags : undefined,
  });

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/jobs?${params.toString()}`);
  };

  const toggleTherapyTag = (tag: TherapyTag) => {
    const newTags = selectedTherapyTags.includes(tag)
      ? selectedTherapyTags.filter((t) => t !== tag)
      : [...selectedTherapyTags, tag];

    const params = new URLSearchParams(searchParams.toString());
    if (newTags.length > 0) {
      params.set('therapyTags', newTags.join(','));
    } else {
      params.delete('therapyTags');
    }
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">구인공고</h1>
            <p className="text-sm text-muted-foreground mt-1">
              교육 관련 채용 정보를 확인하세요
            </p>
          </div>
          {isAuthenticated && (
            <Button asChild>
              <Link href="/jobs/new">
                <Plus className="h-4 w-4 mr-2" />
                공고 등록
              </Link>
            </Button>
          )}
        </div>

        {/* 필터 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {/* 하위 카테고리 필터 */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => updateFilter('jobSubCategory', null)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                !jobSubCategory
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              전체
            </button>
            {ALL_JOB_SUB_CATEGORIES.map(([value, label]) => (
              <button
                key={value}
                onClick={() => updateFilter('jobSubCategory', value)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  jobSubCategory === value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 지역 필터 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => setRegionOpen(!regionOpen)}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-colors ${
                region
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              {region ? REGION_LABELS[region] : '지역'}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {regionOpen && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-background border border-border rounded-lg shadow-lg py-1 z-50 max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    updateFilter('region', null);
                    setRegionOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${
                    !region ? 'text-primary font-medium' : ''
                  }`}
                >
                  전체 지역
                </button>
                {ALL_REGIONS.map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      updateFilter('region', value);
                      setRegionOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${
                      region === value ? 'text-primary font-medium' : ''
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 모집중만 필터 */}
          <button
            onClick={() => updateFilter('isRecruiting', isRecruiting === 'true' ? null : 'true')}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              isRecruiting === 'true'
                ? 'bg-green-500 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            모집중만
          </button>

          {/* 치료/교육 분야 필터 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => setTherapyTagOpen(!therapyTagOpen)}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-colors ${
                selectedTherapyTags.length > 0
                  ? 'bg-orange-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              분야{selectedTherapyTags.length > 0 && ` (${selectedTherapyTags.length})`}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {therapyTagOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
                <div className="px-3 py-1 text-xs text-muted-foreground font-medium">
                  치료/교육 분야 (다중 선택)
                </div>
                {ALL_THERAPY_TAGS.map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => toggleTherapyTag(value as TherapyTag)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2 ${
                      selectedTherapyTags.includes(value as TherapyTag) ? 'text-orange-500 font-medium' : ''
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        selectedTherapyTags.includes(value as TherapyTag)
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {selectedTherapyTags.includes(value as TherapyTag) && '✓'}
                    </span>
                    {label}
                  </button>
                ))}
                {selectedTherapyTags.length > 0 && (
                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete('therapyTags');
                        router.push(`/jobs?${params.toString()}`);
                        setTherapyTagOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted"
                    >
                      선택 초기화
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 목록 */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 border border-border rounded-lg">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            구인공고를 불러올 수 없습니다.
          </div>
        ) : !data?.data?.length ? (
          <div className="text-center py-12 text-muted-foreground">
            등록된 구인공고가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {data.data.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="block p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* 상태 + 카테고리 + 근무형태 */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          post.isRecruiting
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {post.isRecruiting ? '모집중' : '마감'}
                      </span>
                      {post.jobSubCategory && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary">
                          {JOB_SUB_CATEGORY_LABELS[post.jobSubCategory]}
                        </span>
                      )}
                      {post.employmentType && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          {EMPLOYMENT_TYPE_LABELS[post.employmentType]}
                        </span>
                      )}
                      {/* 치료/교육 분야 태그 */}
                      {post.therapyTags && post.therapyTags.length > 0 && (
                        <>
                          {post.therapyTags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs font-medium rounded bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                            >
                              {THERAPY_TAG_LABELS[tag]}
                            </span>
                          ))}
                          {post.therapyTags.length > 3 && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                              +{post.therapyTags.length - 3}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* 기관명 */}
                    {post.organizationName && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {post.organizationName}
                      </div>
                    )}

                    {/* 제목 */}
                    <h3 className="font-medium text-foreground line-clamp-1 mb-2">
                      {post.title}
                    </h3>

                    {/* 정보 */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {post.region && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {REGION_LABELS[post.region]}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Banknote className="h-3.5 w-3.5" />
                        {formatSalary(post)}
                      </span>
                      {post.recruitCount && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {post.recruitCount}명
                        </span>
                      )}
                      {post.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          ~{new Date(post.deadline).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {post.viewCount}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* 페이지네이션 안내 */}
            {data.meta.totalPages > 1 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                총 {data.meta.total}개의 구인공고
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
