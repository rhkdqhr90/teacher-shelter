import { Post, PostCategory, JobSubCategory, Region, SalaryType, EmploymentType } from '@prisma/client';
export declare class PostResponseDto {
    id: string;
    title: string;
    content: string;
    category: PostCategory;
    isAnonymous: boolean;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    author: {
        id: string;
        nickname: string;
        profileImage: string | null;
        jobType: string | null;
        career: number | null;
        isVerified: boolean;
    } | null;
    jobSubCategory: JobSubCategory | null;
    region: Region | null;
    salaryType: SalaryType | null;
    salaryMin: number | null;
    salaryMax: number | null;
    isRecruiting: boolean;
    organizationName: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    contactKakao: string | null;
    deadline: Date | null;
    isAutoClose: boolean;
    recruitCount: number | null;
    workingHours: string | null;
    employmentType: EmploymentType | null;
    benefits: string | null;
    requirements: string | null;
    detailAddress: string | null;
    createdAt: Date;
    updatedAt: Date;
    constructor(post: Post & {
        author?: any;
        _count?: {
            applications?: number;
        };
    });
}
