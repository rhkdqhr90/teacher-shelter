import { ReportStatus, ReportAction } from '@prisma/client';
export declare class UpdateReportDto {
    status?: ReportStatus;
    processingNote?: string;
    action?: ReportAction;
}
