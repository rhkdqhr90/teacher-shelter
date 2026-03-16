import { PrismaService } from '../database/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { ProcessVerificationDto } from './dto/process-verification.dto';
import { VerificationStatus } from '@prisma/client';
export declare class VerificationsService {
    private readonly prisma;
    private readonly uploadsService;
    private readonly notificationsService;
    constructor(prisma: PrismaService, uploadsService: UploadsService, notificationsService: NotificationsService);
    create(userId: string, dto: CreateVerificationRequestDto, file: Express.Multer.File): Promise<{
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
    findMyRequests(userId: string): import("@prisma/client").Prisma.PrismaPromise<{
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
    getMyLatestStatus(userId: string): Promise<{
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
    findAll(page?: number, limit?: number, status?: VerificationStatus): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                nickname: string;
                isVerified: boolean;
                jobType: import("@prisma/client").$Enums.JobType | null;
                career: number | null;
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
    findOne(id: string): Promise<{
        user: {
            id: string;
            email: string;
            nickname: string;
            isVerified: boolean;
            jobType: import("@prisma/client").$Enums.JobType | null;
            career: number | null;
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
    process(id: string, adminId: string, dto: ProcessVerificationDto): Promise<{
        user: {
            id: string;
            email: string;
            nickname: string;
            isVerified: boolean;
            jobType: import("@prisma/client").$Enums.JobType | null;
            career: number | null;
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
    getPendingCount(): Promise<number>;
}
