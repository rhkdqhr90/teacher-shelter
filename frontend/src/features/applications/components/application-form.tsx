'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, CheckCircle, Upload, X, FileText } from 'lucide-react';
import { useCreateApplication, useCheckApplied } from '../hooks/use-applications';
import { useUploadResume } from '@/features/uploads/hooks/use-uploads';
import { useToast } from '@/hooks/use-toast';

interface ApplicationFormProps {
  postId: string;
  isAuthenticated: boolean;
  isRecruiting: boolean;
}

export function ApplicationForm({
  postId,
  isAuthenticated,
  isRecruiting,
}: ApplicationFormProps) {
  const { toast } = useToast();
  const createApplication = useCreateApplication();
  const uploadResume = useUploadResume();
  const { data: checkData, isLoading: isChecking } = useCheckApplied(
    postId,
    isAuthenticated
  );

  const [showForm, setShowForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadedResume, setUploadedResume] = useState<{
    fileUrl: string;
    fileName: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const hasApplied = checkData?.applied || false;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 확장자 검증
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error('허용되지 않는 파일 형식', 'PDF, DOC, DOCX 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      toast.error('파일 크기 초과', '10MB 이하의 파일만 업로드 가능합니다.');
      return;
    }

    setResumeFile(file);

    try {
      const result = await uploadResume.mutateAsync(file);
      setUploadedResume({
        fileUrl: result.fileUrl,
        fileName: result.fileName,
      });
      toast.success('이력서가 업로드되었습니다');
    } catch {
      toast.error('업로드 실패', '이력서 업로드에 실패했습니다.');
      setResumeFile(null);
    }
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setUploadedResume(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createApplication.mutateAsync({
        postId,
        coverLetter: coverLetter || undefined,
        contactPhone: contactPhone || undefined,
        contactEmail: contactEmail || undefined,
        resumeUrl: uploadedResume?.fileUrl,
        resumeFileName: uploadedResume?.fileName,
      });
      toast.success('지원이 완료되었습니다');
      setShowForm(false);
      setResumeFile(null);
      setUploadedResume(null);
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error('지원 실패', errorMessage || '지원에 실패했습니다.');
    }
  };

  if (isChecking) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border border-border flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border border-border text-center">
        <p className="text-sm text-muted-foreground">
          지원하려면 로그인이 필요합니다.
        </p>
      </div>
    );
  }

  if (!isRecruiting) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border border-border text-center">
        <p className="text-sm text-muted-foreground">
          마감된 공고입니다.
        </p>
      </div>
    );
  }

  if (hasApplied) {
    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
        <div>
          <p className="font-medium text-green-700 dark:text-green-300">지원 완료</p>
          <p className="text-sm text-green-600 dark:text-green-400">
            이미 지원한 공고입니다. 마이페이지에서 지원 현황을 확인하세요.
          </p>
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        className="w-full"
        size="lg"
      >
        <Send className="w-4 h-4 mr-2" />
        지원하기
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-muted/30 rounded-lg border border-border space-y-4">
      <h4 className="font-medium">지원서 작성</h4>

      <div>
        <label className="block text-sm font-medium mb-2">자기소개 (선택)</label>
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="간단한 자기소개나 지원 동기를 작성해주세요"
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-y"
          maxLength={3000}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">연락처 (선택)</label>
          <Input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="010-0000-0000"
            maxLength={20}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">이메일 (선택)</label>
          <Input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="example@email.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">이력서 첨부 (선택)</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />
        {!resumeFile && !uploadedResume ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadResume.isPending}
            className="w-full border-dashed"
          >
            <Upload className="w-4 h-4 mr-2" />
            PDF, DOC, DOCX 파일 (최대 10MB)
          </Button>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
            <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <span className="text-sm flex-1 truncate">
              {uploadedResume?.fileName || resumeFile?.name}
            </span>
            {uploadResume.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveResume}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          채용담당자만 이력서를 다운로드할 수 있습니다.
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowForm(false)}
          className="flex-1"
        >
          취소
        </Button>
        <Button
          type="submit"
          disabled={createApplication.isPending}
          className="flex-1"
        >
          {createApplication.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              지원 중...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              지원하기
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
