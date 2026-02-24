import { JobType } from '@prisma/client';
export declare class UpdateUserDto {
    nickname?: string;
    email?: string;
    currentPassword?: string;
    profileImage?: string;
    jobType?: JobType;
    career?: number;
}
