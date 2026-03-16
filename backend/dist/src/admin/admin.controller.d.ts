import type { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { OrphanCleanupService } from '../uploads/orphan-cleanup.service';
import { UploadsService } from '../uploads/uploads.service';
import { UpdateReportDto } from '../reports/dto/update-report.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { BulkDeletePostsDto } from './dto/bulk-delete-posts.dto';
import { CreateAutoContentDto } from './dto/create-auto-content.dto';
import { ProcessVerificationDto } from '../verifications/dto/process-verification.dto';
import { UserRole, ReportStatus, ReportType, VerificationStatus, PostCategory } from '@prisma/client';
export declare class AdminController {
    private readonly adminService;
    private readonly orphanCleanupService;
    private readonly uploadsService;
    constructor(adminService: AdminService, orphanCleanupService: OrphanCleanupService, uploadsService: UploadsService);
    getStats(): Promise<{
        totalUsers: number;
        totalPosts: number;
        totalComments: number;
        pendingReports: number;
        pendingVerifications: number;
        todayUsers: number;
        todayPosts: number;
    }>;
    getReports(page?: string, limit?: string, status?: ReportStatus, type?: ReportType): Promise<{
        data: ({
            reporter: {
                id: string;
                email: string;
                nickname: string;
            };
            targetUser: {
                id: string;
                email: string;
                nickname: string;
            } | null;
            targetPost: {
                id: string;
                title: string;
                authorId: string | null;
            } | null;
            targetComment: {
                id: string;
                content: string;
                authorId: string;
                postId: string;
            } | null;
            processedBy: {
                id: string;
                nickname: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.ReportStatus;
            type: import("@prisma/client").$Enums.ReportType;
            reason: string;
            processedAt: Date | null;
            processingNote: string | null;
            action: import("@prisma/client").$Enums.ReportAction;
            reporterId: string;
            targetUserId: string | null;
            targetPostId: string | null;
            targetCommentId: string | null;
            processedById: string | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getReport(id: string): Promise<{
        reporter: {
            id: string;
            email: string;
            nickname: string;
        };
        targetUser: {
            id: string;
            email: string;
            nickname: string;
        } | null;
        targetPost: {
            id: string;
            title: string;
            content: string;
            authorId: string | null;
            author: {
                id: string;
                nickname: string;
            } | null;
        } | null;
        targetComment: {
            id: string;
            content: string;
            authorId: string;
            author: {
                id: string;
                nickname: string;
            };
        } | null;
        processedBy: {
            id: string;
            nickname: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ReportStatus;
        type: import("@prisma/client").$Enums.ReportType;
        reason: string;
        processedAt: Date | null;
        processingNote: string | null;
        action: import("@prisma/client").$Enums.ReportAction;
        reporterId: string;
        targetUserId: string | null;
        targetPostId: string | null;
        targetCommentId: string | null;
        processedById: string | null;
    }>;
    processReport(id: string, req: Request, dto: UpdateReportDto): Promise<{
        reporter: {
            id: string;
            nickname: string;
        };
        processedBy: {
            id: string;
            nickname: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ReportStatus;
        type: import("@prisma/client").$Enums.ReportType;
        reason: string;
        processedAt: Date | null;
        processingNote: string | null;
        action: import("@prisma/client").$Enums.ReportAction;
        reporterId: string;
        targetUserId: string | null;
        targetPostId: string | null;
        targetCommentId: string | null;
        processedById: string | null;
    }>;
    getUsers(page?: string, limit?: string, search?: string, role?: UserRole): Promise<{
        data: {
            id: string;
            email: string;
            nickname: string;
            role: import("@prisma/client").$Enums.UserRole;
            isVerified: boolean;
            jobType: import("@prisma/client").$Enums.JobType | null;
            career: number | null;
            lastLoginAt: Date | null;
            provider: string | null;
            createdAt: Date;
            _count: {
                posts: number;
                comments: number;
                reportsReceived: number;
            };
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateUserRole(id: string, req: Request, dto: UpdateUserRoleDto): Promise<{
        id: string;
        email: string;
        nickname: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    getPosts(page?: string, limit?: string, search?: string, category?: PostCategory): Promise<{
        data: {
            id: string;
            createdAt: Date;
            title: string;
            category: import("@prisma/client").$Enums.PostCategory;
            isAnonymous: boolean;
            viewCount: number;
            likeCount: number;
            commentCount: number;
            author: {
                id: string;
                email: string;
                nickname: string;
            } | null;
            _count: {
                reports: number;
            };
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    deletePost(id: string): Promise<{
        message: string;
    }>;
    bulkDeletePosts(dto: BulkDeletePostsDto): Promise<{
        message: string;
        deletedCount: number;
    }>;
    createAutoContent(req: Request, dto: CreateAutoContentDto): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        category: import("@prisma/client").$Enums.PostCategory;
        status: string;
        isAutoGenerated: boolean;
        sourceUrl: string | null;
        sourceName: string | null;
        confidence: string | null;
    }>;
    getAutoContent(page?: string, limit?: string, status?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            title: string;
            category: import("@prisma/client").$Enums.PostCategory;
            viewCount: number;
            likeCount: number;
            commentCount: number;
            status: string;
            sourceUrl: string | null;
            sourceName: string | null;
            confidence: string | null;
            author: {
                id: string;
                email: string;
                nickname: string;
            } | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    approveAutoContent(id: string): Promise<{
        id: string;
        title: string;
        status: string;
    }>;
    rejectAutoContent(id: string): Promise<{
        message: string;
    }>;
    deleteComment(id: string): Promise<{
        message: string;
    }>;
    cleanupOrphanFiles(): Promise<{
        deleted: number;
        errors: number;
        message: string;
    }>;
    getVerifications(page?: string, limit?: string, status?: VerificationStatus): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                nickname: string;
                isVerified: boolean;
            };
            processedBy: {
                id: string;
                nickname: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.VerificationStatus;
            userId: string;
            processedAt: Date | null;
            processedById: string | null;
            fileUrl: string;
            originalFileName: string;
            fileType: string;
            fileSize: number;
            isEncrypted: boolean;
            rejectionReason: string | null;
            verificationType: string;
            note: string | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getVerification(id: string): Promise<{
        user: {
            id: string;
            email: string;
            nickname: string;
            isVerified: boolean;
            jobType: import("@prisma/client").$Enums.JobType | null;
            career: number | null;
            createdAt: Date;
        };
        processedBy: {
            id: string;
            email: string;
            nickname: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.VerificationStatus;
        userId: string;
        processedAt: Date | null;
        processedById: string | null;
        fileUrl: string;
        originalFileName: string;
        fileType: string;
        fileSize: number;
        isEncrypted: boolean;
        rejectionReason: string | null;
        verificationType: string;
        note: string | null;
    }>;
    processVerification(id: string, req: Request, dto: ProcessVerificationDto): Promise<{
        user: {
            id: string;
            email: string;
            nickname: string;
            isVerified: boolean;
        };
        processedBy: {
            id: string;
            nickname: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.VerificationStatus;
        userId: string;
        processedAt: Date | null;
        processedById: string | null;
        fileUrl: string;
        originalFileName: string;
        fileType: string;
        fileSize: number;
        isEncrypted: boolean;
        rejectionReason: string | null;
        verificationType: string;
        note: string | null;
    }>;
    downloadVerificationFile(id: string, req: Request, res: Response): Promise<void>;
    getVerificationAccessLogs(id: string): Promise<({
        accessedBy: {
            id: string;
            email: string;
            nickname: string;
        };
    } & {
        id: string;
        createdAt: Date;
        action: string;
        userAgent: string | null;
        ipAddress: string | null;
        verificationRequestId: string;
        accessedById: string;
    })[]>;
}
