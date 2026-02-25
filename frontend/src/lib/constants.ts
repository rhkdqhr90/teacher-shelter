/**
 * 환경 변수 기반 상수 정의
 */

// API 엔드포인트 URL (/api 포함)
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// 서버 베이스 URL (이미지 등 정적 파일용, /api 미포함)
// NEXT_PUBLIC_SERVER_URL을 명시적으로 설정하거나, API_URL에서 /api 제거
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

// 앱 이름
export const APP_NAME = '교사쉼터';

// 페이지네이션 기본값
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

/**
 * 상대 이미지 URL을 절대 URL로 변환
 * 백엔드에서 제공하는 상대 경로 이미지를 프론트엔드에서 사용 가능한 절대 URL로 변환
 */
export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '';
  // 이미 절대 URL이면 그대로 반환
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  // 상대 경로면 SERVER_URL 붙이기
  return `${SERVER_URL}${imageUrl}`;
}
