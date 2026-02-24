import { ReportType } from '@prisma/client';
export declare class CreateReportDto {
    type: ReportType;
    reason: string;
    targetUserId?: string;
    targetPostId?: string;
    targetCommentId?: string;
}
