import type { Banner } from '../types';

// 1차 구현: 하드코딩된 배너 데이터
// 향후 백엔드 API로 대체 가능
export const PROMO_BANNERS: Banner[] = [
  {
    id: '1',
    imageUrl: '/images/banners/welcome-banner.svg',
    linkUrl: null,
    alt: '교사쉼터에 오신 것을 환영합니다',
  },
  // 추가 배너는 여기에 추가
];
