import type { LoggerService } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
export declare class OrphanCleanupService {
    private readonly prisma;
    private readonly logger;
    private readonly uploadDir;
    private readonly orphanThresholdMs;
    private isRunning;
    constructor(prisma: PrismaService, logger: LoggerService);
    handleCron(): Promise<void>;
    cleanupOrphanFiles(): Promise<{
        deleted: number;
        errors: number;
    }>;
    private cleanupPostImages;
    private cleanupProfileImages;
}
