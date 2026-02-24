import { User, JobType, ExpertType } from '@prisma/client';
type UserWithoutPassword = Omit<User, 'password' | 'providerId'>;
export declare class UserResponseDto {
    id: string;
    email: string;
    nickname: string;
    role: string;
    provider: string;
    isVerified: boolean;
    jobType: JobType | null;
    career: number | null;
    profileImage: string | null;
    isExpert: boolean;
    expertType: ExpertType | null;
    expertVerifiedAt: Date | null;
    lastLoginAt: Date | null;
    isBanned: boolean;
    bannedAt: Date | null;
    bannedUntil: Date | null;
    banReason: string | null;
    createdAt: Date;
    updatedAt: Date;
    constructor(user: UserWithoutPassword);
}
export {};
