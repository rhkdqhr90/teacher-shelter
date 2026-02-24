import { PrismaService } from '../database/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportType, ReportStatus } from '@prisma/client';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(reporterId: string, dto: CreateReportDto): Promise<{
        reporter: {
            id: string;
            nickname: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.ReportType;
        reason: string;
        status: import("@prisma/client").$Enums.ReportStatus;
        processedAt: Date | null;
        processingNote: string | null;
        action: import("@prisma/client").$Enums.ReportAction;
        reporterId: string;
        targetUserId: string | null;
        targetPostId: string | null;
        targetCommentId: string | null;
        processedById: string | null;
    }>;
    private validateReportTarget;
    findMyReports(userId: string, page?: number, limit?: number): Promise<{
        data: ({
            targetUser: {
                id: string;
                nickname: string;
            } | null;
            targetPost: {
                id: string;
                title: string;
            } | null;
            targetComment: {
                id: string;
                content: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.ReportType;
            reason: string;
            status: import("@prisma/client").$Enums.ReportStatus;
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
    findAll(page?: number, limit?: number, status?: ReportStatus, type?: ReportType): Promise<{
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
            type: import("@prisma/client").$Enums.ReportType;
            reason: string;
            status: import("@prisma/client").$Enums.ReportStatus;
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
    findOne(id: string): Promise<{
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
        type: import("@prisma/client").$Enums.ReportType;
        reason: string;
        status: import("@prisma/client").$Enums.ReportStatus;
        processedAt: Date | null;
        processingNote: string | null;
        action: import("@prisma/client").$Enums.ReportAction;
        reporterId: string;
        targetUserId: string | null;
        targetPostId: string | null;
        targetCommentId: string | null;
        processedById: string | null;
    }>;
    process(id: string, adminId: string, dto: UpdateReportDto): Promise<{
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
        type: import("@prisma/client").$Enums.ReportType;
        reason: string;
        status: import("@prisma/client").$Enums.ReportStatus;
        processedAt: Date | null;
        processingNote: string | null;
        action: import("@prisma/client").$Enums.ReportAction;
        reporterId: string;
        targetUserId: string | null;
        targetPostId: string | null;
        targetCommentId: string | null;
        processedById: string | null;
    }>;
    private validateActionForReportType;
    private executeAction;
    private banUser;
    getPendingCount(): Promise<number>;
    private deletePostImages;
}
