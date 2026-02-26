import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreateApplicationDto, UpdateApplicationStatusDto, ApplicationResponseDto } from './dto';
export declare class ApplicationsService {
    private readonly prisma;
    private readonly notificationsService;
    private readonly uploadsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, uploadsService: UploadsService);
    create(userId: string, dto: CreateApplicationDto): Promise<ApplicationResponseDto>;
    findMyApplications(userId: string): Promise<ApplicationResponseDto[]>;
    findByPost(postId: string, userId: string): Promise<ApplicationResponseDto[]>;
    findOne(id: string, userId: string): Promise<ApplicationResponseDto>;
    updateStatus(id: string, userId: string, dto: UpdateApplicationStatusDto): Promise<ApplicationResponseDto>;
    cancel(id: string, userId: string): Promise<void>;
    getApplicationCount(postId: string): Promise<number>;
    hasApplied(postId: string, userId: string): Promise<boolean>;
    getResume(applicationId: string, userId: string): Promise<{
        buffer: Buffer;
        fileName: string;
        mimeType: string;
    }>;
}
