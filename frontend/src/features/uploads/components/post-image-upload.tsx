'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SERVER_URL } from '@/lib/constants';
import { resizeImage } from '@/lib/image-utils';
import { useUploadPostImage } from '../hooks/use-uploads';

interface PostImageUploadProps {
  onImageInsert: (imageUrl: string) => void;
}

export function PostImageUpload({ onImageInsert }: PostImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useUploadPostImage();

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

    try {
      // 업로드 전 이미지 최적화 (리사이징 + WebP 변환)
      const optimizedFile = await resizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
      });

      const result = await uploadMutation.mutateAsync(optimizedFile);
      // 마크다운 이미지 문법으로 삽입
      onImageInsert(`![이미지](${SERVER_URL}${result.imageUrl})`);
    } catch {
      setError('이미지 업로드에 실패했습니다.');
    }

    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadMutation.isPending}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-input',
          'hover:bg-muted transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {uploadMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            업로드 중...
          </>
        ) : (
          <>
            <ImagePlus className="w-4 h-4" />
            이미지 첨부
          </>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <div className="flex items-center gap-1 text-sm text-destructive">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="p-0.5 hover:bg-destructive/10 rounded"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
