import { NotificationType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(params: {
        type: NotificationType;
        userId: string;
        actorId?: string;
        postId?: string;
        commentId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        postId: string | null;
        userId: string;
        type: import("@prisma/client").$Enums.NotificationType;
        actorId: string | null;
        commentId: string | null;
        isRead: boolean;
        readAt: Date | null;
    } | null>;
    findAllByUser(userId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            type: import("@prisma/client").$Enums.NotificationType;
            actor: any;
            post: any;
            commentId: string | null;
            isRead: boolean;
            createdAt: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            unreadCount: number;
        };
    }>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(userId: string, notificationId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    delete(userId: string, notificationId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
