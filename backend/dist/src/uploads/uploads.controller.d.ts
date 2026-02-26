import type { Request } from 'express';
import { UploadsService } from './uploads.service';
export declare class UploadsController {
    private readonly uploadsService;
    constructor(uploadsService: UploadsService);
    uploadProfileImage(req: Request, file: Express.Multer.File): Promise<{
        imageUrl: string;
    }>;
    deleteProfileImage(req: Request): Promise<{
        message: string;
    }>;
    uploadPostImage(req: Request, file: Express.Multer.File): Promise<{
        imageUrl: string;
    }>;
    uploadBannerImage(req: Request, file: Express.Multer.File): Promise<{
        imageUrl: string;
    }>;
    uploadResume(req: Request, file: Express.Multer.File): Promise<{
        fileUrl: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
    }>;
    uploadMaterial(req: Request, file: Express.Multer.File): Promise<{
        fileUrl: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
    }>;
}
