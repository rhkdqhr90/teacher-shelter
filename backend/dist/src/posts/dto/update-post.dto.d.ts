import { PostCategory, JobSubCategory, Region, SalaryType, EmploymentType, TherapyTag } from '@prisma/client';
import { AttachmentInputDto } from './create-post.dto';
export declare class UpdatePostDto {
    title?: string;
    content?: string;
    category?: PostCategory;
    jobSubCategory?: JobSubCategory;
    region?: Region;
    salaryType?: SalaryType;
    salaryMin?: number;
    salaryMax?: number;
    isRecruiting?: boolean;
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
    attachments?: AttachmentInputDto[];
}
