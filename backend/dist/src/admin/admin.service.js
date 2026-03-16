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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const reports_service_1 = require("../reports/reports.service");
const notifications_service_1 = require("../notifications/notifications.service");
const uploads_service_1 = require("../uploads/uploads.service");
const client_1 = require("@prisma/client");
const counter_util_1 = require("../common/utils/counter.util");
let AdminService = class AdminService {
    prisma;
    reportsService;
    notificationsService;
    uploadsService;
    constructor(prisma, reportsService, notificationsService, uploadsService) {
        this.prisma = prisma;
        this.reportsService = reportsService;
        this.notificationsService = notificationsService;
        this.uploadsService = uploadsService;
    }
    async getStats() {
        const [totalUsers, totalPosts, totalComments, pendingReports, pendingVerifications, todayUsers, todayPosts,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.post.count(),
            this.prisma.comment.count(),
            this.reportsService.getPendingCount(),
            this.prisma.verificationRequest.count({
                where: { status: client_1.VerificationStatus.PENDING },
            }),
            this.prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            }),
            this.prisma.post.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            }),
        ]);
        return {
            totalUsers,
            totalPosts,
            totalComments,
            pendingReports,
            pendingVerifications,
            todayUsers,
            todayPosts,
        };
    }
    async getReports(page = 1, limit = 20, status, type) {
        return this.reportsService.findAll(page, limit, status, type);
    }
    async getReport(id) {
        return this.reportsService.findOne(id);
    }
    async processReport(id, adminId, dto) {
        return this.reportsService.process(id, adminId, dto);
    }
    async getUsers(page = 1, limit = 20, search, role) {
        const skip = (page - 1) * limit;
        const where = {
            ...(search && {
                OR: [
                    { email: { contains: search, mode: 'insensitive' } },
                    { nickname: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...(role && { role }),
        };
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    nickname: true,
                    role: true,
                    isVerified: true,
                    jobType: true,
                    career: true,
                    provider: true,
                    createdAt: true,
                    lastLoginAt: true,
                    _count: {
                        select: {
                            posts: true,
                            comments: true,
                            reportsReceived: true,
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
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
    async updateUserRole(userId, role, adminId) {
        if (userId === adminId) {
            throw new common_1.BadRequestException('자신의 권한은 변경할 수 없습니다');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('사용자를 찾을 수 없습니다');
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: { role },
            select: {
                id: true,
                email: true,
                nickname: true,
                role: true,
            },
        });
    }
    async deleteUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('사용자를 찾을 수 없습니다');
        }
        if (user.role === client_1.UserRole.ADMIN) {
            throw new common_1.BadRequestException('관리자 계정은 삭제할 수 없습니다');
        }
        await this.prisma.$transaction(async (tx) => {
            const userComments = await tx.comment.findMany({
                where: { authorId: userId },
                select: { id: true, postId: true },
            });
            const commentCountByPost = new Map();
            for (const comment of userComments) {
                const current = commentCountByPost.get(comment.postId) || 0;
                commentCountByPost.set(comment.postId, current + 1);
            }
            for (const [postId, count] of commentCountByPost) {
                await (0, counter_util_1.safeDecrementCommentCount)(tx, postId, count).catch(() => {
                });
            }
            const userLikes = await tx.like.findMany({
                where: { userId },
                select: { postId: true },
            });
            const likeCountByPost = new Map();
            for (const like of userLikes) {
                const current = likeCountByPost.get(like.postId) || 0;
                likeCountByPost.set(like.postId, current + 1);
            }
            for (const [postId, count] of likeCountByPost) {
                await (0, counter_util_1.safeDecrementLikeCount)(tx, postId, count).catch(() => {
                });
            }
            await tx.user.delete({
                where: { id: userId },
            });
        });
        return { message: '사용자가 삭제되었습니다' };
    }
    async deletePost(postId) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });
        if (!post) {
            throw new common_1.NotFoundException('게시글을 찾을 수 없습니다');
        }
        await this.deletePostImages(post.content);
        await this.prisma.post.delete({
            where: { id: postId },
        });
        return { message: '게시글이 삭제되었습니다' };
    }
    async deleteComment(commentId) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId },
        });
        if (!comment) {
            throw new common_1.NotFoundException('댓글을 찾을 수 없습니다');
        }
        await this.prisma.$transaction(async (tx) => {
            const replyCount = await tx.comment.count({
                where: { parentCommentId: commentId },
            });
            await tx.comment.delete({
                where: { id: commentId },
            });
            await (0, counter_util_1.safeDecrementCommentCount)(tx, comment.postId, 1 + replyCount);
        });
        return { message: '댓글이 삭제되었습니다' };
    }
    async getPosts(page = 1, limit = 20, search, category) {
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (category) {
            where.category = category;
        }
        const [data, total] = await Promise.all([
            this.prisma.post.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    category: true,
                    isAnonymous: true,
                    viewCount: true,
                    likeCount: true,
                    commentCount: true,
                    createdAt: true,
                    author: {
                        select: { id: true, nickname: true, email: true },
                    },
                    _count: {
                        select: { reports: true },
                    },
                },
            }),
            this.prisma.post.count({ where }),
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
    async bulkDeletePosts(ids) {
        const posts = await this.prisma.post.findMany({
            where: { id: { in: ids } },
            select: { content: true },
        });
        for (const post of posts) {
            await this.deletePostImages(post.content);
        }
        const result = await this.prisma.post.deleteMany({
            where: { id: { in: ids } },
        });
        return {
            message: `${result.count}개의 게시글이 삭제되었습니다`,
            deletedCount: result.count,
        };
    }
    async deletePostImages(content) {
        try {
            const imageUrlRegex = /\/uploads\/post\/[a-zA-Z0-9_\-.]+/g;
            const matches = content.match(imageUrlRegex);
            if (!matches || matches.length === 0)
                return;
            const uniqueUrls = [...new Set(matches)];
            await Promise.all(uniqueUrls.map((url) => this.uploadsService.deleteFile(url)));
        }
        catch {
        }
    }
    async createAutoContent(authorId, dto) {
        const post = await this.prisma.post.create({
            data: {
                title: dto.title,
                content: dto.content,
                category: dto.category,
                status: dto.status || 'DRAFT',
                isAutoGenerated: true,
                sourceUrl: dto.sourceUrl,
                sourceName: dto.sourceName,
                confidence: dto.confidence,
                authorId,
            },
            select: {
                id: true,
                title: true,
                category: true,
                status: true,
                isAutoGenerated: true,
                sourceUrl: true,
                sourceName: true,
                confidence: true,
                createdAt: true,
            },
        });
        return post;
    }
    async getAutoContent(page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const where = {
            isAutoGenerated: true,
            ...(status && status !== 'ALL' ? { status } : {}),
        };
        const [data, total] = await Promise.all([
            this.prisma.post.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    category: true,
                    status: true,
                    sourceUrl: true,
                    sourceName: true,
                    confidence: true,
                    viewCount: true,
                    likeCount: true,
                    commentCount: true,
                    createdAt: true,
                    author: {
                        select: { id: true, nickname: true, email: true },
                    },
                },
            }),
            this.prisma.post.count({ where }),
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
    async approveAutoContent(id) {
        const post = await this.prisma.post.findUnique({
            where: { id },
        });
        if (!post) {
            throw new common_1.NotFoundException('게시글을 찾을 수 없습니다');
        }
        if (!post.isAutoGenerated) {
            throw new common_1.BadRequestException('자동생성 콘텐츠가 아닙니다');
        }
        return this.prisma.post.update({
            where: { id },
            data: { status: 'PUBLISHED' },
            select: {
                id: true,
                title: true,
                status: true,
            },
        });
    }
    async rejectAutoContent(id) {
        const post = await this.prisma.post.findUnique({
            where: { id },
        });
        if (!post) {
            throw new common_1.NotFoundException('게시글을 찾을 수 없습니다');
        }
        if (!post.isAutoGenerated) {
            throw new common_1.BadRequestException('자동생성 콘텐츠가 아닙니다');
        }
        await this.deletePostImages(post.content);
        await this.prisma.post.delete({
            where: { id },
        });
        return { message: '자동생성 콘텐츠가 삭제되었습니다' };
    }
    async getVerifications(page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const where = status ? { status } : {};
        const [data, total] = await Promise.all([
            this.prisma.verificationRequest.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            nickname: true,
                            isVerified: true,
                        },
                    },
                    processedBy: {
                        select: {
                            id: true,
                            nickname: true,
                        },
                    },
                },
            }),
            this.prisma.verificationRequest.count({ where }),
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
    async getVerification(id) {
        const verification = await this.prisma.verificationRequest.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        nickname: true,
                        isVerified: true,
                        jobType: true,
                        career: true,
                        createdAt: true,
                    },
                },
                processedBy: {
                    select: {
                        id: true,
                        nickname: true,
                        email: true,
                    },
                },
            },
        });
        if (!verification) {
            throw new common_1.NotFoundException('인증 요청을 찾을 수 없습니다');
        }
        return verification;
    }
    async processVerification(id, adminId, dto) {
        const verification = await this.prisma.verificationRequest.findUnique({
            where: { id },
            include: { user: true },
        });
        if (!verification) {
            throw new common_1.NotFoundException('인증 요청을 찾을 수 없습니다');
        }
        if (verification.status !== client_1.VerificationStatus.PENDING) {
            throw new common_1.BadRequestException('이미 처리된 인증 요청입니다');
        }
        if (dto.status === client_1.VerificationStatus.REJECTED && !dto.rejectionReason) {
            throw new common_1.BadRequestException('반려 사유를 입력해주세요');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.verificationRequest.update({
                where: { id },
                data: {
                    status: dto.status,
                    processedById: adminId,
                    processedAt: new Date(),
                    rejectionReason: dto.rejectionReason,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            nickname: true,
                            isVerified: true,
                        },
                    },
                    processedBy: {
                        select: {
                            id: true,
                            nickname: true,
                        },
                    },
                },
            });
            if (dto.status === client_1.VerificationStatus.APPROVED) {
                await tx.user.update({
                    where: { id: verification.userId },
                    data: { isVerified: true },
                });
            }
            return updated;
        });
        const notificationType = dto.status === client_1.VerificationStatus.APPROVED
            ? client_1.NotificationType.VERIFICATION_APPROVED
            : client_1.NotificationType.VERIFICATION_REJECTED;
        await this.notificationsService.create({
            userId: verification.userId,
            actorId: adminId,
            type: notificationType,
        });
        return result;
    }
    async logVerificationAccess(verificationRequestId, adminId, action, ipAddress, userAgent) {
        await this.prisma.verificationAccessLog.create({
            data: {
                verificationRequestId,
                accessedById: adminId,
                action,
                ipAddress,
                userAgent,
            },
        });
    }
    async getVerificationAccessLogs(verificationRequestId) {
        return this.prisma.verificationAccessLog.findMany({
            where: { verificationRequestId },
            include: {
                accessedBy: {
                    select: { id: true, nickname: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        reports_service_1.ReportsService,
        notifications_service_1.NotificationsService,
        uploads_service_1.UploadsService])
], AdminService);
//# sourceMappingURL=admin.service.js.map