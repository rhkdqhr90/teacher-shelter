import type { Request } from 'express';
import { VerificationsService } from './verifications.service';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
export declare class VerificationsController {
    private readonly verificationsService;
    constructor(verificationsService: VerificationsService);
    create(req: Request, dto: CreateVerificationRequestDto, file: Express.Multer.File): Promise<{
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
    getMyRequests(req: Request): import("@prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    getMyStatus(req: Request): Promise<{
        hasRequest: boolean;
        latestStatus: import("@prisma/client").$Enums.VerificationStatus | null;
        latestRequest: {
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
        } | null;
    }>;
}
