import { JobType } from '@prisma/client';
export declare class RegisterDto {
    email: string;
    password: string;
    nickname: string;
    jobType?: JobType;
    career?: number;
    agreedTerms: boolean;
    agreedPrivacy: boolean;
}
