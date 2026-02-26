import { StreamableFile } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationStatusDto, ApplicationResponseDto } from './dto';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    create(req: Request, dto: CreateApplicationDto): Promise<ApplicationResponseDto>;
    findMyApplications(req: Request): Promise<ApplicationResponseDto[]>;
    findByPost(postId: string, req: Request): Promise<ApplicationResponseDto[]>;
    checkApplied(postId: string, req: Request): Promise<{
        applied: boolean;
    }>;
    findOne(id: string, req: Request): Promise<ApplicationResponseDto>;
    updateStatus(id: string, req: Request, dto: UpdateApplicationStatusDto): Promise<ApplicationResponseDto>;
    cancel(id: string, req: Request): Promise<{
        message: string;
    }>;
    downloadResume(id: string, req: Request, res: Response): Promise<StreamableFile>;
}
