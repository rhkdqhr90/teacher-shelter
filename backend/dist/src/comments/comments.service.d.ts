import type { LoggerService } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
export declare class CommentsService {
    private readonly prisma;
    private readonly notificationsService;
    private readonly logger;
    private readonly MAX_COMMENTS_PER_POST;
    private readonly MAX_COMMENTS_PER_USER_PER_MINUTE;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, logger: LoggerService);
    create(postId: string, userId: string, createCommentDto: CreateCommentDto): Promise<CommentResponseDto>;
    private createNotifications;
    findAllByPost(postId: string, page?: number, limit?: number): Promise<{
        data: CommentResponseDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    update(id: string, userId: string, updateCommentDto: UpdateCommentDto): Promise<CommentResponseDto>;
    remove(id: string, userId: string): Promise<void>;
}
