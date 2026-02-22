/**
 * 이미지 최적화 유틸리티
 */

interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputType?: 'image/jpeg' | 'image/webp' | 'image/png';
}

const DEFAULT_OPTIONS: Required<ResizeOptions> = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85,
  outputType: 'image/webp',
};

/**
 * 이미지를 리사이징하고 최적화합니다.
 * WebP 포맷으로 변환하여 용량을 줄입니다.
 */
export async function resizeImage(
  file: File,
  options: ResizeOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // GIF는 리사이징하지 않음 (애니메이션 유지)
  if (file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('캔버스 컨텍스트를 사용할 수 없습니다.'));
      return;
    }

    img.onload = () => {
      let { width, height } = img;

      // 비율 유지하면서 최대 크기에 맞춤
      if (width > opts.maxWidth || height > opts.maxHeight) {
        const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, width, height);

      // Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('이미지를 생성할 수 없습니다.'));
            return;
          }

          // 파일 이름에서 확장자 변경
          const originalName = file.name.replace(/\.[^.]+$/, '');
          const extension = opts.outputType === 'image/webp' ? 'webp' :
                           opts.outputType === 'image/png' ? 'png' : 'jpg';
          const newFileName = `${originalName}.${extension}`;

          const resizedFile = new File([blob], newFileName, {
            type: opts.outputType,
            lastModified: Date.now(),
          });

          resolve(resizedFile);
        },
        opts.outputType,
        opts.quality
      );
    };

    img.onerror = () => {
      reject(new Error('이미지를 불러올 수 없습니다.'));
    };

    // 파일을 Data URL로 읽기
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('파일을 읽을 수 없습니다.'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * 이미지 파일의 실제 크기를 가져옵니다.
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('이미지를 불러올 수 없습니다.'));
    };

    img.src = url;
  });
}

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환합니다.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
