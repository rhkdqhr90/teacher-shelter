import { PostCategory, JobSubCategory, Region, SalaryType, EmploymentType, TherapyTag } from '@prisma/client';
export declare class CreatePostDto {
    title: string;
    content: string;
    category?: PostCategory;
    isAnonymous?: boolean;
    jobSubCategory?: JobSubCategory;
    region?: Region;
    salaryType?: SalaryType;
    salaryMin?: number;
    salaryMax?: number;
    organizationName?: string;
    contactPhone?: string;
    contactEmail?: string;
    contactKakao?: string;
    deadline?: string;
    isAutoClose?: boolean;
    recruitCount?: number;
    workingHours?: string;
    employmentType?: EmploymentType;
    benefits?: string;
    requirements?: string;
    detailAddress?: string;
    therapyTags?: TherapyTag[];
}
