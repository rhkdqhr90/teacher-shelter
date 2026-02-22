'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2, Trash2, User } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { SERVER_URL } from '@/lib/constants';
import { useUploadProfileImage, useDeleteProfileImage } from '../hooks/use-uploads';

interface ProfileImageUploadProps {
  currentImage: string | null | undefined;
  onSuccess?: () => void;
}

export function ProfileImageUpload({ currentImage, onSuccess }: ProfileImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useUploadProfileImage();
  const deleteMutation = useDeleteProfileImage();

  const isLoading = uploadMutation.isPending || deleteMutation.isPending;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB를 초과할 수 없습니다.');
      return;
    }

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('JPEG, PNG, GIF, WebP 이미지만 업로드 가능합니다.');
      return;
    }

    // 프리뷰 표시
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 업로드
    try {
      await uploadMutation.mutateAsync(file);
      setPreviewUrl(null);
      onSuccess?.();
    } catch {
      setError('이미지 업로드에 실패했습니다.');
      setPreviewUrl(null);
    }

    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!currentImage) return;

    setError(null);
    try {
      await deleteMutation.mutateAsync();
      onSuccess?.();
    } catch {
      setError('이미지 삭제에 실패했습니다.');
    }
  };

  const displayImage = previewUrl || (currentImage ? `${SERVER_URL}${currentImage}` : null);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Image container */}
      <div className="relative">
        <div
          className={cn(
            'relative w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden',
            isLoading && 'opacity-50'
          )}
        >
          {displayImage ? (
            <Image
              src={displayImage}
              alt="프로필 이미지"
              fill
              sizes="96px"
              className="object-cover"
              unoptimized={displayImage.startsWith('data:')}
            />
          ) : (
            <User className="w-12 h-12 text-muted-foreground" />
          )}
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {/* Camera button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 disabled:opacity-50"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Delete button */}
      {currentImage && !isLoading && (
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          이미지 삭제
        </button>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        JPEG, PNG, GIF, WebP (최대 5MB)
      </p>
    </div>
  );
}
