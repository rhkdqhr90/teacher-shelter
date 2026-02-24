import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
export declare class TokenCleanupService implements OnModuleInit, OnModuleDestroy {
    private readonly prisma;
    private readonly logger;
    private readonly CLEANUP_INTERVAL_MS;
    private cleanupTimer;
    constructor(prisma: PrismaService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    cleanupExpiredTokens(): Promise<void>;
}
