import type { LoggerService } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
export type UploadType = 'profile' | 'post' | 'verification' | 'banner' | 'resume' | 'material';
export declare class UploadsService {
    private readonly prisma;
    private readonly logger;
    private readonly uploadDir;
    private readonly maxFileSize;
    private readonly allowedMimeTypes;
    private readonly allowedExtensions;
    private readonly documentMimeTypes;
    private readonly documentExtensions;
    private readonly verificationMaxFileSize;
    private readonly resumeMaxFileSize;
    private readonly resumeMimeTypes;
    private readonly resumeExtensions;
    private readonly materialMaxFileSize;
    private readonly materialMimeTypes;
    private readonly materialExtensions;
    private readonly imageMagicNumbers;
    private readonly documentMagicNumbers;
    private readonly materialMagicNumbers;
    constructor(prisma: PrismaService, logger: LoggerService);
    private ensureUploadDirs;
    private validateMagicNumber;
    validateFile(file: Express.Multer.File): void;
    private optimizeImage;
    saveFile(file: Express.Multer.File, type: UploadType, userId: string): Promise<string>;
    updateProfileImage(userId: string, file: Express.Multer.File): Promise<{
        imageUrl: string;
    }>;
    deleteFile(fileUrl: string): Promise<void>;
    deleteProfileImage(userId: string): Promise<{
        message: string;
    }>;
    private validateDocumentMagicNumber;
    validateVerificationFile(file: Express.Multer.File): void;
    saveVerificationFile(file: Express.Multer.File, userId: string): Promise<{
        fileUrl: string;
        originalFileName: string;
        fileType: string;
        fileSize: number;
        isEncrypted: boolean;
    }>;
    readVerificationFile(fileUrl: string, isEncrypted: boolean): Promise<Buffer>;
    validateResumeFile(file: Express.Multer.File): void;
    saveResumeFile(file: Express.Multer.File, userId: string): Promise<{
        fileUrl: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
    }>;
    readResumeFile(fileUrl: string): Promise<Buffer>;
    private validateMaterialMagicNumber;
    validateMaterialFile(file: Express.Multer.File): void;
    saveMaterialFile(file: Express.Multer.File, userId: string): Promise<{
        fileUrl: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
    }>;
    readMaterialFile(fileUrl: string): Promise<Buffer>;
}
