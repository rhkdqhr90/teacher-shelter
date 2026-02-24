import type { LoggerService } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
export declare class JobAutoCloseService {
    private readonly prisma;
    private readonly logger;
    private isRunning;
    constructor(prisma: PrismaService, logger: LoggerService);
    handleCron(): Promise<void>;
    closeExpiredJobs(): Promise<{
        closed: number;
    }>;
}
