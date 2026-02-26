export interface Banner {
  id: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  alt: string;
  // 텍스트 배너 전용 필드
  bannerText?: string | null;
  subText?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  isActive?: boolean;
  priority?: number;
}
