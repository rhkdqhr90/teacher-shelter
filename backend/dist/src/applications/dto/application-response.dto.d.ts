import { Application, ApplicationStatus } from '@prisma/client';
export declare class ApplicationResponseDto {
    id: string;
    postId: string;
    applicantId: string;
    status: ApplicationStatus;
    coverLetter: string | null;
    resumeUrl: string | null;
    resumeFileName: string | null;
    recruiterNote: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    createdAt: Date;
    updatedAt: Date;
    post?: {
        id: string;
        title: string;
        organizationName: string | null;
        isRecruiting: boolean;
    };
    applicant?: {
        id: string;
        nickname: string;
        email: string;
        profileImage: string | null;
        jobType: string | null;
        career: number | null;
    };
    constructor(application: Application & {
        post?: any;
        applicant?: any;
    });
}
