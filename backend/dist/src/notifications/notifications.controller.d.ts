import type { Request } from 'express';
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(req: Request, page?: string, limit?: string): Promise<{
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
    getUnreadCount(req: Request): Promise<{
        count: number;
    }>;
    markAsRead(req: Request, id: string): Promise<{
        message: string;
    }>;
    markAllAsRead(req: Request): Promise<{
        message: string;
    }>;
    delete(req: Request, id: string): Promise<{
        message: string;
    }>;
}
