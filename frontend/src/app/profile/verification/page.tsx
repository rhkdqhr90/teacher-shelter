'use client';

import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload, FileText, CheckCircle, XCircle, Clock, AlertCircle, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { verificationsApi, VerificationRequest } from '@/features/verifications';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          <Clock className="w-3 h-3" />
          대기 중
        </span>
      );
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="w-3 h-3" />
          승인됨
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <XCircle className="w-3 h-3" />
          반려됨
        </span>
      );
    default:
      return null;
  }
}

export default function VerificationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [verificationType, setVerificationType] = useState('');
  const [note, setNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 내 인증 상태 조회
  const { data: statusData, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['verification-status'],
    queryFn: verificationsApi.getMyStatus,
  });

  // 내 인증 요청 목록 조회
  const { data: requests = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ['my-verifications'],
    queryFn: verificationsApi.getMyRequests,
  });

  // 인증 요청 생성
  const createMutation = useMutation({
    mutationFn: verificationsApi.create,
    onSuccess: () => {
      toast.success('인증 요청이 제출되었습니다');
      queryClient.invalidateQueries({ queryKey: ['verification-status'] });
      queryClient.invalidateQueries({ queryKey: ['my-verifications'] });
      setVerificationType('');
      setNote('');
      setSelectedFile(null);
    },
    onError: (error: unknown) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error('인증 요청 실패', errorMessage || '인증 요청에 실패했습니다.');
    },
  });

  const handleFileSelect = useCallback((file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('지원하지 않는 파일 형식입니다', 'JPEG, PNG, GIF, WebP, PDF, DOC, DOCX만 허용됩니다.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('파일 크기 초과', '파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }
    setSelectedFile(file);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationType.trim()) {
      toast.error('인증 유형을 입력해주세요');
      return;
    }
    if (!selectedFile) {
      toast.error('파일을 선택해주세요');
      return;
    }
    createMutation.mutate({
      verificationType: verificationType.trim(),
      note: note.trim() || undefined,
      file: selectedFile,
    });
  };

  const hasPendingRequest = statusData?.latestStatus === 'PENDING';

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/profile" className="text-foreground-muted hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">신분 인증</h1>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-xl space-y-6">
        {/* Current Status */}
        {!isLoadingStatus && statusData && (
          <div className="bg-card rounded-lg border p-4">
            <h2 className="text-sm font-semibold text-foreground-muted mb-3">현재 인증 상태</h2>
            {statusData.latestRequest ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{statusData.latestRequest.verificationType}</p>
                  <p className="text-sm text-foreground-muted">
                    {formatDate(statusData.latestRequest.createdAt)}
                  </p>
                </div>
                {getStatusBadge(statusData.latestRequest.status)}
              </div>
            ) : (
              <p className="text-sm text-foreground-muted">인증 요청 내역이 없습니다.</p>
            )}
          </div>
        )}

        {/* New Request Form */}
        <div className="bg-card rounded-lg border p-4">
          <h2 className="text-sm font-semibold text-foreground-muted mb-4">인증 요청</h2>

          {hasPendingRequest ? (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-700 dark:text-yellow-300">대기 중인 요청이 있습니다</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  이전 요청이 처리될 때까지 새로운 인증 요청을 할 수 없습니다.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Verification Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  인증 유형 <span className="text-destructive">*</span>
                </label>
                <Input
                  value={verificationType}
                  onChange={(e) => setVerificationType(e.target.value)}
                  placeholder="예: 재직증명서, 사업자등록증, 교원자격증"
                  maxLength={50}
                />
                <p className="text-xs text-foreground-muted mt-1">
                  인증하고자 하는 서류 종류를 입력해주세요
                </p>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  인증 서류 <span className="text-destructive">*</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-primary" />
                        <div className="text-left">
                          <p className="font-medium text-sm truncate max-w-[200px]">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-foreground-muted">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-10 h-10 mx-auto text-foreground-muted mb-2" />
                      <p className="text-sm text-foreground-muted mb-2">
                        파일을 드래그하여 놓거나 클릭하여 선택
                      </p>
                      <p className="text-xs text-foreground-muted">
                        JPEG, PNG, GIF, WebP, PDF, DOC, DOCX (최대 10MB)
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        파일 선택
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  추가 메모 (선택)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="관리자에게 전달할 추가 메모가 있다면 작성해주세요"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-y"
                  maxLength={500}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending || !verificationType.trim() || !selectedFile}
              >
                {createMutation.isPending ? '제출 중...' : '인증 요청'}
              </Button>
            </form>
          )}
        </div>

        {/* Request History */}
        <div className="bg-card rounded-lg border">
          <h2 className="px-4 py-3 text-sm font-semibold text-foreground-muted border-b">
            인증 요청 내역
          </h2>
          {isLoadingRequests ? (
            <div className="p-4 text-center text-foreground-muted">로딩 중...</div>
          ) : requests.length === 0 ? (
            <div className="p-4 text-center text-foreground-muted">인증 요청 내역이 없습니다.</div>
          ) : (
            <div className="divide-y divide-border">
              {requests.map((request: VerificationRequest) => (
                <div key={request.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{request.verificationType}</p>
                      <p className="text-xs text-foreground-muted">
                        {request.originalFileName}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-xs text-foreground-muted">
                    {formatDate(request.createdAt)}
                  </p>
                  {request.status === 'REJECTED' && request.rejectionReason && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
                      <span className="font-medium">반려 사유:</span> {request.rejectionReason}
                    </div>
                  )}
                  {request.processedAt && (
                    <p className="text-xs text-foreground-muted mt-1">
                      처리일: {formatDate(request.processedAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
