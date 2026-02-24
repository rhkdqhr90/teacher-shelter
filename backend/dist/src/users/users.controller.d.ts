import type { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UserResponseDto } from './dto/user-response.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: Request): Promise<UserResponseDto>;
    updateProfile(req: Request, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
    changePassword(req: Request, changePasswordDto: ChangePasswordDto): Promise<void>;
    getMyPosts(req: Request, page?: string, limit?: string): Promise<{
        data: {
            likeCount: number;
            commentCount: number;
            _count: undefined;
            author: {
                id: string;
                nickname: string;
                isVerified: boolean;
                jobType: import("@prisma/client").$Enums.JobType | null;
                career: number | null;
            } | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            content: string;
            category: import("@prisma/client").$Enums.PostCategory;
            isAnonymous: boolean;
            ipHash: string | null;
            anonymousAuthorId: string | null;
            viewCount: number;
            jobSubCategory: import("@prisma/client").$Enums.JobSubCategory | null;
            region: import("@prisma/client").$Enums.Region | null;
            salaryType: import("@prisma/client").$Enums.SalaryType | null;
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
            employmentType: import("@prisma/client").$Enums.EmploymentType | null;
            benefits: string | null;
            requirements: string | null;
            detailAddress: string | null;
            therapyTags: import("@prisma/client").$Enums.TherapyTag[];
            authorId: string | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getMyComments(req: Request, page?: string, limit?: string): Promise<{
        data: ({
            post: {
                id: string;
                title: string;
                category: import("@prisma/client").$Enums.PostCategory;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            authorId: string;
            postId: string;
            parentCommentId: string | null;
            mentionedUserId: string | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getMyBookmarks(req: Request, page?: string, limit?: string): Promise<{
        data: {
            id: string;
            title: string;
            content: string;
            category: import("@prisma/client").$Enums.PostCategory;
            isAnonymous: boolean;
            viewCount: number;
            likeCount: number;
            commentCount: number;
            createdAt: Date;
            author: {
                id: string;
                nickname: string;
                isVerified: boolean;
                jobType: import("@prisma/client").$Enums.JobType | null;
                career: number | null;
            } | null;
            bookmarkedAt: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getMyLikes(req: Request, page?: string, limit?: string): Promise<{
        data: {
            id: string;
            title: string;
            content: string;
            category: import("@prisma/client").$Enums.PostCategory;
            isAnonymous: boolean;
            viewCount: number;
            likeCount: number;
            commentCount: number;
            createdAt: Date;
            author: {
                id: string;
                nickname: string;
                isVerified: boolean;
                jobType: import("@prisma/client").$Enums.JobType | null;
                career: number | null;
            } | null;
            likedAt: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    searchUsers(query: string, limit?: string): Promise<{
        id: string;
        nickname: string;
        isVerified: boolean;
        jobType: import("@prisma/client").$Enums.JobType | null;
    }[]>;
    getDashboardStats(req: Request): Promise<{
        postCount: number;
        commentCount: number;
        receivedLikeCount: number;
        bookmarkCount: number;
    }>;
    getRecentActivity(req: Request, limit?: string): Promise<{
        recentPosts: {
            likeCount: number;
            commentCount: number;
            _count: undefined;
            id: string;
            createdAt: Date;
            title: string;
            category: import("@prisma/client").$Enums.PostCategory;
        }[];
        recentComments: {
            id: string;
            createdAt: Date;
            post: {
                id: string;
                title: string;
            };
            content: string;
        }[];
    }>;
    deleteAccount(req: Request, deleteAccountDto: DeleteAccountDto): Promise<void>;
}
