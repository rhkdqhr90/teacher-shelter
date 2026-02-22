'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProfile, useUpdateProfile } from '../hooks/use-profile';
import { JOB_TYPE_LABELS, updateProfileSchema } from '../types';
import { ProfileImageUpload } from '@/features/uploads/components/profile-image-upload';

const JOB_TYPES = [
  'SPECIAL_EDUCATION',
  'DAYCARE_TEACHER',
  'KINDERGARTEN',
  'CARE_TEACHER',
  'STUDENT',
  'DIRECTOR',
  'LAWYER',
  'OTHER',
] as const;

export function ProfileEditForm() {
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [nickname, setNickname] = useState('');
  const [jobType, setJobType] = useState<string>('');
  const [career, setCareer] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname);
      setJobType(profile.jobType || '');
      setCareer(profile.career?.toString() || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const data = {
      nickname,
      jobType: jobType || undefined,
      career: career ? parseInt(career, 10) : undefined,
    };

    const result = updateProfileSchema.safeParse(data);
    if (!result.success) {
      setError(result.error.errors[0]?.message || '입력을 확인해주세요.');
      return;
    }

    try {
      await updateProfile.mutateAsync(result.data);
      setSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 1000);
    } catch {
      setError('프로필 수정에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
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

      {success && (
        <div className="p-3 bg-green-50 text-green-600 rounded-md text-sm">
          프로필이 수정되었습니다.
        </div>
      )}

      {/* Profile Image */}
      <div className="flex justify-center py-4">
        <ProfileImageUpload currentImage={profile?.profileImage} />
      </div>

      {/* Email (readonly) */}
      <div>
        <label className="block text-sm font-medium mb-2">이메일</label>
        <Input value={profile?.email || ''} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground mt-1">이메일은 변경할 수 없습니다.</p>
      </div>

      {/* Nickname */}
      <div>
        <label htmlFor="nickname" className="block text-sm font-medium mb-2">
          닉네임
        </label>
        <Input
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임을 입력하세요"
          maxLength={20}
        />
      </div>

      {/* Job Type */}
      <div>
        <label htmlFor="jobType" className="block text-sm font-medium mb-2">
          직업
        </label>
        <select
          id="jobType"
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">선택하세요</option>
          {JOB_TYPES.map((type) => (
            <option key={type} value={type}>
              {JOB_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      {/* Career */}
      <div>
        <label htmlFor="career" className="block text-sm font-medium mb-2">
          경력 (년차)
        </label>
        <Input
          id="career"
          type="number"
          min="0"
          max="50"
          value={career}
          onChange={(e) => setCareer(e.target.value)}
          placeholder="경력을 입력하세요"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
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
          disabled={updateProfile.isPending}
          className="flex-1"
        >
          {updateProfile.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            '저장하기'
          )}
        </Button>
      </div>
    </form>
  );
}
