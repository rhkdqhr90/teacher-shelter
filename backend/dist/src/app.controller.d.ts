import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';
export declare class AppController {
    private readonly appService;
    private readonly prisma;
    constructor(appService: AppService, prisma: PrismaService);
    getHello(): string;
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        database: string;
    }>;
}
