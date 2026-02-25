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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const client_1 = require("@prisma/client");
const counter_util_1 = require("../common/utils/counter.util");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(reporterId, dto) {
        if (dto.type === client_1.ReportType.USER && dto.targetUserId === reporterId) {
            throw new common_1.BadRequestException('자기 자신을 신고할 수 없습니다');
        }
        await this.validateReportTarget(dto, reporterId);
        const existingReport = await this.prisma.report.findFirst({
            where: {
                reporterId,
                targetUserId: dto.targetUserId,
                targetPostId: dto.targetPostId,
                targetCommentId: dto.targetCommentId,
                status: client_1.ReportStatus.PENDING,
            },
        });
        if (existingReport) {
            throw new common_1.ConflictException('이미 신고 접수된 대상입니다');
        }
        return this.prisma.report.create({
            data: {
                type: dto.type,
                reason: dto.reason,
                reporterId,
                targetUserId: dto.targetUserId,
                targetPostId: dto.targetPostId,
                targetCommentId: dto.targetCommentId,
            },
            include: {
                reporter: {
                    select: { id: true, nickname: true },
                },
            },
        });
    }
    async validateReportTarget(dto, reporterId) {
        switch (dto.type) {
            case client_1.ReportType.USER:
                if (!dto.targetUserId) {
                    throw new common_1.BadRequestException('신고할 사용자를 선택해주세요');
                }
                const user = await this.prisma.user.findUnique({
                    where: { id: dto.targetUserId },
                });
                if (!user) {
                    throw new common_1.NotFoundException('신고할 사용자를 찾을 수 없습니다');
                }
                break;
            case client_1.ReportType.POST:
                if (!dto.targetPostId) {
                    throw new common_1.BadRequestException('신고할 게시글을 선택해주세요');
                }
                const post = await this.prisma.post.findUnique({
                    where: { id: dto.targetPostId },
                });
                if (!post) {
                    throw new common_1.NotFoundException('신고할 게시글을 찾을 수 없습니다');
                }
                if (post.authorId === reporterId) {
                    throw new common_1.BadRequestException('자신의 게시글은 신고할 수 없습니다');
                }
                break;
            case client_1.ReportType.COMMENT:
                if (!dto.targetCommentId) {
                    throw new common_1.BadRequestException('신고할 댓글을 선택해주세요');
                }
                const comment = await this.prisma.comment.findUnique({
                    where: { id: dto.targetCommentId },
                });
                if (!comment) {
                    throw new common_1.NotFoundException('신고할 댓글을 찾을 수 없습니다');
                }
                if (comment.authorId === reporterId) {
                    throw new common_1.BadRequestException('자신의 댓글은 신고할 수 없습니다');
                }
                break;
        }
    }
    async findMyReports(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.report.findMany({
                where: { reporterId: userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    targetUser: { select: { id: true, nickname: true } },
                    targetPost: { select: { id: true, title: true } },
                    targetComment: { select: { id: true, content: true } },
                },
            }),
            this.prisma.report.count({ where: { reporterId: userId } }),
        ]);
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findAll(page = 1, limit = 20, status, type) {
        const skip = (page - 1) * limit;
        const where = {
            ...(status && { status }),
            ...(type && { type }),
        };
        const [data, total] = await Promise.all([
            this.prisma.report.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    reporter: { select: { id: true, nickname: true, email: true } },
                    targetUser: { select: { id: true, nickname: true, email: true } },
                    targetPost: { select: { id: true, title: true, authorId: true } },
                    targetComment: {
                        select: { id: true, content: true, authorId: true, postId: true },
                    },
                    processedBy: { select: { id: true, nickname: true } },
                },
            }),
            this.prisma.report.count({ where }),
        ]);
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const report = await this.prisma.report.findUnique({
            where: { id },
            include: {
                reporter: { select: { id: true, nickname: true, email: true } },
                targetUser: { select: { id: true, nickname: true, email: true } },
                targetPost: {
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        authorId: true,
                        author: { select: { id: true, nickname: true } },
                    },
                },
                targetComment: {
                    select: {
                        id: true,
                        content: true,
                        authorId: true,
                        author: { select: { id: true, nickname: true } },
                    },
                },
                processedBy: { select: { id: true, nickname: true } },
            },
        });
        if (!report) {
            throw new common_1.NotFoundException('신고를 찾을 수 없습니다');
        }
        return report;
    }
    async process(id, adminId, dto) {
        const report = await this.prisma.report.findUnique({
            where: { id },
            include: {
                targetPost: { select: { id: true, authorId: true } },
                targetComment: { select: { id: true, authorId: true } },
                targetUser: { select: { id: true } },
            },
        });
        if (!report) {
            throw new common_1.NotFoundException('신고를 찾을 수 없습니다');
        }
        if (report.status !== client_1.ReportStatus.PENDING) {
            throw new common_1.BadRequestException('이미 처리된 신고입니다');
        }
        if (dto.action && dto.action !== client_1.ReportAction.NONE) {
            this.validateActionForReportType(report.type, dto.action);
            await this.executeAction(report, dto.action);
        }
        return this.prisma.report.update({
            where: { id },
            data: {
                status: dto.status,
                processingNote: dto.processingNote,
                processedById: adminId,
                processedAt: new Date(),
                action: dto.action || client_1.ReportAction.NONE,
            },
            include: {
                reporter: { select: { id: true, nickname: true } },
                processedBy: { select: { id: true, nickname: true } },
            },
        });
    }
    validateActionForReportType(type, action) {
        if (action === client_1.ReportAction.POST_DELETE && type !== client_1.ReportType.POST) {
            throw new common_1.BadRequestException('게시글 삭제는 게시글 신고에서만 가능합니다');
        }
        if (action === client_1.ReportAction.COMMENT_DELETE && type !== client_1.ReportType.COMMENT) {
            throw new common_1.BadRequestException('댓글 삭제는 댓글 신고에서만 가능합니다');
        }
    }
    async executeAction(report, action) {
        switch (action) {
            case client_1.ReportAction.POST_DELETE:
                if (report.targetPost) {
                    const postToDelete = await this.prisma.post.findUnique({
                        where: { id: report.targetPost.id },
                        select: { content: true },
                    });
                    if (postToDelete) {
                        await this.deletePostImages(postToDelete.content);
                    }
                    await this.prisma.post.delete({
                        where: { id: report.targetPost.id },
                    });
                }
                break;
            case client_1.ReportAction.COMMENT_DELETE:
                if (report.targetComment) {
                    const commentToDelete = await this.prisma.comment.findUnique({
                        where: { id: report.targetComment.id },
                        select: { postId: true },
                    });
                    if (commentToDelete) {
                        await this.prisma.$transaction(async (tx) => {
                            const replyCount = await tx.comment.count({
                                where: { parentCommentId: report.targetComment.id },
                            });
                            await tx.comment.delete({
                                where: { id: report.targetComment.id },
                            });
                            await (0, counter_util_1.safeDecrementCommentCount)(tx, commentToDelete.postId, 1 + replyCount);
                        });
                    }
                }
                break;
            case client_1.ReportAction.WARNING:
                break;
            case client_1.ReportAction.USER_BAN_1DAY:
            case client_1.ReportAction.USER_BAN_7DAYS:
            case client_1.ReportAction.USER_BAN_30DAYS:
            case client_1.ReportAction.USER_BAN_PERMANENT:
                await this.banUser(report, action);
                break;
        }
    }
    async banUser(report, action) {
        let targetUserId = null;
        if (report.targetUser) {
            targetUserId = report.targetUser.id;
        }
        else if (report.targetPost) {
            targetUserId = report.targetPost.authorId;
        }
        else if (report.targetComment) {
            targetUserId = report.targetComment.authorId;
        }
        if (!targetUserId)
            return;
        let bannedUntil = null;
        const now = new Date();
        switch (action) {
            case client_1.ReportAction.USER_BAN_1DAY:
                bannedUntil = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
                break;
            case client_1.ReportAction.USER_BAN_7DAYS:
                bannedUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                break;
            case client_1.ReportAction.USER_BAN_30DAYS:
                bannedUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                break;
            case client_1.ReportAction.USER_BAN_PERMANENT:
                bannedUntil = null;
                break;
        }
        const accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: targetUserId },
                data: {
                    isBanned: true,
                    bannedAt: now,
                    bannedUntil,
                    banReason: report.reason,
                },
            });
            await tx.refreshToken.deleteMany({
                where: { userId: targetUserId },
            });
            await tx.tokenBlacklist.create({
                data: {
                    userId: targetUserId,
                    expiresAt: accessTokenExpiry,
                    reason: 'user_ban',
                },
            });
        });
    }
    async getPendingCount() {
        return this.prisma.report.count({
            where: { status: client_1.ReportStatus.PENDING },
        });
    }
    async deletePostImages(content) {
        try {
            const imageUrlRegex = /\/uploads\/post\/[a-zA-Z0-9_\-.]+/g;
            const matches = content.match(imageUrlRegex);
            if (!matches || matches.length === 0)
                return;
            const uniqueUrls = [...new Set(matches)];
            const fs = await import('fs');
            const path = await import('path');
            const uploadDir = path.join(process.cwd(), 'uploads');
            await Promise.all(uniqueUrls.map(async (url) => {
                const filePath = path.join(uploadDir, url.replace('/uploads/', ''));
                const normalizedPath = path.resolve(filePath);
                if (!normalizedPath.startsWith(uploadDir + path.sep)) {
                    return;
                }
                try {
                    await fs.promises.unlink(normalizedPath);
                }
                catch {
                }
            }));
        }
        catch {
        }
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map