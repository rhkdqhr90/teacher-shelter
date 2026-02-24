import { PostCategory, JobSubCategory, Region, TherapyTag } from '@prisma/client';
export declare class PaginationDto {
    page: number;
    limit: number;
    category?: PostCategory;
    search?: string;
    sort: 'createdAt' | 'viewCount' | 'likeCount';
    order: 'asc' | 'desc';
    jobSubCategory?: JobSubCategory;
    region?: Region;
    isRecruiting?: boolean;
    therapyTags?: TherapyTag[];
}
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
