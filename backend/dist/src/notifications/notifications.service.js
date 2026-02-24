"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(params) {
        if (params.actorId && params.userId === params.actorId) {
            return null;
        }
        return this.prisma.notification.create({
            data: {
                type: params.type,
                userId: params.userId,
                actorId: params.actorId,
                postId: params.postId,
                commentId: params.commentId,
            },
        });
    }
    async findAllByUser(userId, page = 1, limit = 20) {
        const maxLimit = 50;
        const safeLimit = Math.min(limit, maxLimit);
        const skip = (page - 1) * safeLimit;
        const [notifications, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                skip,
                take: safeLimit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where: { userId } }),
            this.prisma.notification.count({ where: { userId, isRead: false } }),
        ]);
        const actorIds = [
            ...new Set(notifications.map((n) => n.actorId).filter(Boolean)),
        ];
        const postIds = [
            ...new Set(notifications.map((n) => n.postId).filter(Boolean)),
        ];
        const [actors, posts] = await Promise.all([
            actorIds.length > 0
                ? this.prisma.user.findMany({
                    where: { id: { in: actorIds } },
                    select: { id: true, nickname: true },
                })
                : [],
            postIds.length > 0
                ? this.prisma.post.findMany({
                    where: { id: { in: postIds } },
                    select: { id: true, title: true },
                })
                : [],
        ]);
        const actorMap = new Map(actors.map((a) => [a.id, a]));
        const postMap = new Map(posts.map((p) => [p.id, p]));
        const data = notifications.map((n) => ({
            id: n.id,
            type: n.type,
            actor: n.actorId ? actorMap.get(n.actorId) || null : null,
            post: n.postId ? postMap.get(n.postId) || null : null,
            commentId: n.commentId,
            isRead: n.isRead,
            createdAt: n.createdAt,
        }));
        return {
            data,
            meta: {
                page,
                limit: safeLimit,
                total,
                totalPages: Math.ceil(total / safeLimit),
                unreadCount,
            },
        };
    }
    async getUnreadCount(userId) {
        return this.prisma.notification.count({
            where: { userId, isRead: false },
        });
    }
    async markAsRead(userId, notificationId) {
        return this.prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true, readAt: new Date() },
        });
    }
    async markAllAsRead(userId) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
    }
    async delete(userId, notificationId) {
        return this.prisma.notification.deleteMany({
            where: { id: notificationId, userId },
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map