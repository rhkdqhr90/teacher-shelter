import { BannerType } from '@prisma/client';
export declare class CreateBannerDto {
    title: string;
    imageUrl?: string;
    linkUrl?: string;
    alt: string;
    type?: BannerType;
    bannerText?: string;
    subText?: string;
    bgColor?: string;
    textColor?: string;
    isActive?: boolean;
    priority?: number;
    startDate?: string;
    endDate?: string;
}
