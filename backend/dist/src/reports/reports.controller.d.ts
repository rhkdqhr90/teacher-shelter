import type { Request } from 'express';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    create(req: Request, dto: CreateReportDto): Promise<{
        reporter: {
            id: string;
            nickname: string;
        };
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
    findMyReports(req: Request, page?: string, limit?: string): Promise<{
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
}
