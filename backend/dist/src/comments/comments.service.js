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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const nest_winston_1 = require("nest-winston");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const comment_response_dto_1 = require("./dto/comment-response.dto");
const counter_util_1 = require("../common/utils/counter.util");
let CommentsService = class CommentsService {
    prisma;
    notificationsService;
    logger;
    MAX_COMMENTS_PER_POST = 100;
    MAX_COMMENTS_PER_USER_PER_MINUTE = 5;
    constructor(prisma, notificationsService, logger) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.logger = logger;
    }
    async create(postId, userId, createCommentDto) {
        const { parentCommentId, mentionedUserId, content } = createCommentDto;
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            throw new common_1.NotFoundException('게시글을 찾을 수 없습니다');
        }
        if (post.category === client_1.PostCategory.JOB_POSTING ||
            post.category === client_1.PostCategory.LEGAL_QNA) {
            throw new common_1.BadRequestException('이 게시판에서는 댓글을 작성할 수 없습니다');
        }
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        const recentCommentCount = await this.prisma.comment.count({
            where: {
                authorId: userId,
                createdAt: { gte: oneMinuteAgo },
            },
        });
        if (recentCommentCount >= this.MAX_COMMENTS_PER_USER_PER_MINUTE) {
            throw new common_1.BadRequestException('댓글을 너무 자주 작성하고 있습니다. 잠시 후 다시 시도해주세요.');
        }
        if (parentCommentId) {
            const parentComment = await this.prisma.comment.findUnique({
                where: { id: parentCommentId },
            });
            if (!parentComment) {
                throw new common_1.NotFoundException('부모 댓글을 찾을 수 없습니다');
            }
            if (parentComment.parentCommentId) {
                throw new common_1.BadRequestException('대댓글에는 답글을 작성할 수 없습니다');
            }
            if (parentComment.postId !== postId) {
                throw new common_1.BadRequestException('부모 댓글이 해당 게시글에 속하지 않습니다');
            }
        }
        if (mentionedUserId) {
            const mentionedUser = await this.prisma.user.findUnique({
                where: { id: mentionedUserId },
            });
            if (!mentionedUser) {
                throw new common_1.NotFoundException('멘션된 사용자를 찾을 수 없습니다');
            }
        }
        const comment = await this.prisma.$transaction(async (tx) => {
            const currentPost = await tx.post.findUnique({
                where: { id: postId },
                select: { commentCount: true },
            });
            if (currentPost &&
                currentPost.commentCount >= this.MAX_COMMENTS_PER_POST) {
                throw new common_1.BadRequestException(`이 게시글에는 더 이상 댓글을 작성할 수 없습니다 (최대 ${this.MAX_COMMENTS_PER_POST}개)`);
            }
            const newComment = await tx.comment.create({
                data: {
                    content,
                    postId,
                    authorId: userId,
                    parentCommentId,
                    mentionedUserId,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            nickname: true,
                            profileImage: true,
                        },
                    },
                    mentionedUser: {
                        select: {
                            id: true,
                            nickname: true,
                        },
                    },
                },
            });
            await tx.post.update({
                where: { id: postId },
                data: { commentCount: { increment: 1 } },
            });
            return newComment;
        });
        this.createNotifications(post, comment, parentCommentId, mentionedUserId, userId).catch((err) => {
            this.logger.error('Failed to create notification', err, 'CommentsService');
        });
        return new comment_response_dto_1.CommentResponseDto(comment);
    }
    async createNotifications(post, comment, parentCommentId, mentionedUserId, actorId) {
        if (parentCommentId) {
            const parentComment = await this.prisma.comment.findUnique({
                where: { id: parentCommentId },
                select: { authorId: true },
            });
            if (parentComment?.authorId && parentComment.authorId !== actorId) {
                await this.notificationsService.create({
                    type: client_1.NotificationType.REPLY,
                    userId: parentComment.authorId,
                    actorId,
                    postId: post.id,
                    commentId: comment.id,
                });
            }
        }
        else if (post.authorId && post.authorId !== actorId) {
            await this.notificationsService.create({
                type: client_1.NotificationType.COMMENT,
                userId: post.authorId,
                actorId,
                postId: post.id,
                commentId: comment.id,
            });
        }
        if (mentionedUserId && mentionedUserId !== actorId) {
            await this.notificationsService.create({
                type: client_1.NotificationType.MENTION,
                userId: mentionedUserId,
                actorId,
                postId: post.id,
                commentId: comment.id,
            });
        }
    }
    async findAllByPost(postId, page = 1, limit = 50) {
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            throw new common_1.NotFoundException('게시글을 찾을 수 없습니다');
        }
        const maxLimit = 100;
        const safeLimit = Math.min(limit, maxLimit);
        const skip = (page - 1) * safeLimit;
        const [comments, total] = await Promise.all([
            this.prisma.comment.findMany({
                where: {
                    postId,
                    parentCommentId: null,
                },
                skip,
                take: safeLimit,
                include: {
                    author: {
                        select: {
                            id: true,
                            nickname: true,
                            profileImage: true,
                        },
                    },
                    mentionedUser: {
                        select: {
                            id: true,
                            nickname: true,
                        },
                    },
                    replies: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    nickname: true,
                                    profileImage: true,
                                },
                            },
                            mentionedUser: {
                                select: {
                                    id: true,
                                    nickname: true,
                                },
                            },
                        },
                        orderBy: { createdAt: 'asc' },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.comment.count({
                where: { postId, parentCommentId: null },
            }),
        ]);
        return {
            data: comments.map((comment) => new comment_response_dto_1.CommentResponseDto(comment)),
            meta: {
                page,
                limit: safeLimit,
                total,
                totalPages: Math.ceil(total / safeLimit),
            },
        };
    }
    async update(id, userId, updateCommentDto) {
        const comment = await this.prisma.comment.findUnique({ where: { id } });
        if (!comment) {
            throw new common_1.NotFoundException('댓글을 찾을 수 없습니다');
        }
        if (comment.authorId !== userId) {
            throw new common_1.ForbiddenException('본인의 댓글만 수정할 수 있습니다');
        }
        const updatedComment = await this.prisma.comment.update({
            where: { id },
            data: updateCommentDto,
            include: {
                author: {
                    select: {
                        id: true,
                        nickname: true,
                        profileImage: true,
                    },
                },
                mentionedUser: {
                    select: {
                        id: true,
                        nickname: true,
                    },
                },
            },
        });
        return new comment_response_dto_1.CommentResponseDto(updatedComment);
    }
    async remove(id, userId) {
        const comment = await this.prisma.comment.findUnique({ where: { id } });
        if (!comment) {
            throw new common_1.NotFoundException('댓글을 찾을 수 없습니다');
        }
        if (comment.authorId !== userId) {
            throw new common_1.ForbiddenException('본인의 댓글만 삭제할 수 있습니다');
        }
        await this.prisma.$transaction(async (tx) => {
            const replyCount = await tx.comment.count({
                where: { parentCommentId: id },
            });
            await tx.comment.delete({ where: { id } });
            await (0, counter_util_1.safeDecrementCommentCount)(tx, comment.postId, 1 + replyCount);
        });
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService, Object])
], CommentsService);
//# sourceMappingURL=comments.service.js.map