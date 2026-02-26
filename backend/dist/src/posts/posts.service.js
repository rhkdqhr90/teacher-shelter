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
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const nest_winston_1 = require("nest-winston");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const uploads_service_1 = require("../uploads/uploads.service");
const post_response_dto_1 = require("./dto/post-response.dto");
const ip_util_1 = require("../common/utils/ip.util");
const view_tracker_util_1 = require("../common/utils/view-tracker.util");
const counter_util_1 = require("../common/utils/counter.util");
let PostsService = class PostsService {
    prisma;
    notificationsService;
    uploadsService;
    logger;
    constructor(prisma, notificationsService, uploadsService, logger) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.uploadsService = uploadsService;
        this.logger = logger;
    }
    async create(userId, createPostDto, ip) {
        if (createPostDto.salaryMin !== undefined &&
            createPostDto.salaryMax !== undefined &&
            createPostDto.salaryMin > createPostDto.salaryMax) {
            throw new common_1.BadRequestException('최소 급여는 최대 급여보다 클 수 없습니다');
        }
        const deadlineDate = createPostDto.deadline
            ? new Date(createPostDto.deadline)
            : undefined;
        const { attachments, deadline, ...postData } = createPostDto;
        const validAttachments = createPostDto.category === 'CLASS_MATERIAL' ? attachments : undefined;
        const post = await this.prisma.post.create({
            data: {
                ...postData,
                deadline: deadlineDate,
                authorId: createPostDto.isAnonymous ? null : userId,
                anonymousAuthorId: createPostDto.isAnonymous ? userId : null,
                ipHash: createPostDto.isAnonymous ? (0, ip_util_1.hashIp)(ip) : null,
                ...(validAttachments &&
                    validAttachments.length > 0 && {
                    attachments: {
                        create: validAttachments.map((attachment) => ({
                            fileUrl: attachment.fileUrl,
                            fileName: attachment.fileName,
                            fileSize: attachment.fileSize,
                            mimeType: attachment.mimeType,
                        })),
                    },
                }),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        nickname: true,
                        profileImage: true,
                        jobType: true,
                        career: true,
                        isVerified: true,
                    },
                },
                attachments: true,
            },
        });
        return new post_response_dto_1.PostResponseDto(post);
    }
    async findAll(pagination) {
        const { page, limit, category, search, sort, order, jobSubCategory, region, isRecruiting, } = pagination;
        const skip = (page - 1) * limit;
        const allowedSortFields = {
            createdAt: true,
            viewCount: true,
            likeCount: true,
        };
        if (!allowedSortFields[sort]) {
            throw new common_1.BadRequestException('잘못된 정렬 필드입니다');
        }
        const where = {};
        if (category) {
            where.category = category;
        }
        if (search) {
            if (search.length > 100) {
                throw new common_1.BadRequestException('검색어가 너무 깁니다 (최대 100자)');
            }
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (jobSubCategory) {
            where.jobSubCategory = jobSubCategory;
        }
        if (region) {
            where.region = region;
        }
        if (isRecruiting !== undefined) {
            where.isRecruiting = isRecruiting;
        }
        if (pagination.therapyTags && pagination.therapyTags.length > 0) {
            where.therapyTags = {
                hasSome: pagination.therapyTags,
            };
        }
        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sort]: order },
                include: {
                    author: {
                        select: {
                            id: true,
                            nickname: true,
                            profileImage: true,
                            jobType: true,
                            career: true,
                            isVerified: true,
                        },
                    },
                },
            }),
            this.prisma.post.count({ where }),
        ]);
        return {
            data: posts.map((post) => new post_response_dto_1.PostResponseDto(post)),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id, ip) {
        const ipHash = (0, ip_util_1.hashIp)(ip);
        const existingPost = await this.prisma.post.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        nickname: true,
                        profileImage: true,
                        jobType: true,
                        career: true,
                        isVerified: true,
                    },
                },
                attachments: true,
            },
        });
        if (!existingPost) {
            throw new common_1.NotFoundException('게시글을 찾을 수 없습니다');
        }
        if (view_tracker_util_1.viewTracker.shouldIncrementView(id, ipHash)) {
            await this.prisma.post.update({
                where: { id },
                data: { viewCount: { increment: 1 } },
            });
            return new post_response_dto_1.PostResponseDto({
                ...existingPost,
                viewCount: existingPost.viewCount + 1,
            });
        }
        return new post_response_dto_1.PostResponseDto(existingPost);
    }
    async update(id, userId, updatePostDto) {
        const post = await this.prisma.post.findUnique({
            where: { id },
        });
        if (!post) {
            throw new common_1.NotFoundException('게시글을 찾을 수 없습니다');
        }
        if (post.isAnonymous) {
            throw new common_1.ForbiddenException('익명 게시글은 수정할 수 없습니다');
        }
        if (post.authorId !== userId) {
            throw new common_1.ForbiddenException('본인이 작성한 게시글만 수정할 수 있습니다');
        }
        if (updatePostDto.category && updatePostDto.category !== post.category) {
            throw new common_1.BadRequestException('게시글의 카테고리는 변경할 수 없습니다');
        }
        const deadlineDate = updatePostDto.deadline
            ? new Date(updatePostDto.deadline)
            : undefined;
        const { attachments, deadline, ...postData } = updatePostDto;
        const updatedPost = await this.prisma.$transaction(async (tx) => {
            if (post.category === 'CLASS_MATERIAL' && attachments !== undefined) {
                await tx.postAttachment.deleteMany({
                    where: { postId: id },
                });
                if (attachments.length > 0) {
                    await tx.postAttachment.createMany({
                        data: attachments.map((att) => ({
                            postId: id,
                            fileUrl: att.fileUrl,
                            fileName: att.fileName,
                            fileSize: att.fileSize,
                            mimeType: att.mimeType,
                        })),
                    });
                }
            }
            return tx.post.update({
                where: { id },
                data: {
                    ...postData,
                    deadline: deadlineDate,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            nickname: true,
                            profileImage: true,
                            jobType: true,
                            career: true,
                            isVerified: true,
                        },
                    },
                    attachments: true,
                },
            });
        });
        return new post_response_dto_1.PostResponseDto(updatedPost);
    }
    async remove(id, userId, ip) {
        const post = await this.prisma.post.findUnique({
            where: { id },
        });
        if (!post) {
            throw new common_1.NotFoundException('게시글을 찾을 수 없습니다');
        }
        if (post.isAnonymous) {
            if (post.anonymousAuthorId) {
                if (post.anonymousAuthorId !== userId) {
                    throw new common_1.ForbiddenException('본인이 작성한 게시글만 삭제할 수 있습니다');
                }
            }
            else {
                const currentIpHash = (0, ip_util_1.hashIp)(ip);
                if (post.ipHash !== currentIpHash) {
                    throw new common_1.ForbiddenException('익명 게시글은 작성한 네트워크 환경에서만 삭제할 수 있습니다');
                }
            }
        }
        else {
            if (post.authorId !== userId) {
                throw new common_1.ForbiddenException('본인이 작성한 게시글만 삭제할 수 있습니다');
            }
        }
        await this.deletePostImages(post.content);
        await this.prisma.post.delete({
            where: { id },
        });
    }
    async deletePostImages(content) {
        try {
            const imageUrlRegex = /\/uploads\/post\/[a-zA-Z0-9_\-.]+/g;
            const matches = content.match(imageUrlRegex);
            if (!matches || matches.length === 0) {
                return;
            }
            const uniqueUrls = [...new Set(matches)];
            this.logger.log(`Deleting ${uniqueUrls.length} images from post`, 'PostsService');
            await Promise.all(uniqueUrls.map((url) => this.uploadsService.deleteFile(url)));
        }
        catch (error) {
            this.logger.warn(`Failed to delete post images: ${error}`, 'PostsService');
        }
    }
    async getHotPosts(limit = 5) {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const posts = await this.prisma.post.findMany({
            where: {
                createdAt: { gte: oneDayAgo },
            },
            orderBy: [{ likeCount: 'desc' }, { viewCount: 'desc' }],
            take: limit,
            include: {
                author: {
                    select: {
                        id: true,
                        nickname: true,
                        profileImage: true,
                        jobType: true,
                        career: true,
                        isVerified: true,
                    },
                },
            },
        });
        if (posts.length === 0) {
            const fallbackPosts = await this.prisma.post.findMany({
                orderBy: [{ likeCount: 'desc' }, { viewCount: 'desc' }],
                take: limit,
                include: {
                    author: {
                        select: {
                            id: true,
                            nickname: true,
                            profileImage: true,
                            jobType: true,
                            career: true,
                            isVerified: true,
                        },
                    },
                },
            });
            return fallbackPosts.map((post) => new post_response_dto_1.PostResponseDto(post));
        }
        return posts.map((post) => new post_response_dto_1.PostResponseDto(post));
    }
    async getCategoryPreviews(categories, limit = 3) {
        const safeCategories = categories.slice(0, 15);
        const safeLimit = Math.min(Math.max(1, limit), 5);
        const results = await Promise.all(safeCategories.map(async (category) => {
            const posts = await this.prisma.post.findMany({
                where: { category: category },
                orderBy: { createdAt: 'desc' },
                take: safeLimit,
                select: {
                    id: true,
                    title: true,
                    category: true,
                    viewCount: true,
                    likeCount: true,
                    commentCount: true,
                    createdAt: true,
                    isAnonymous: true,
                    author: {
                        select: {
                            id: true,
                            nickname: true,
                            isVerified: true,
                        },
                    },
                },
            });
            return {
                category,
                posts,
            };
        }));
        return results;
    }
    async toggleLike(postId, userId) {
        return this.prisma.$transaction(async (tx) => {
            const post = await tx.post.findUnique({
                where: { id: postId },
            });
            if (!post) {
                throw new common_1.NotFoundException('게시글을 찾을 수 없습니다');
            }
            const existingLike = await tx.like.findUnique({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
            });
            if (existingLike) {
                await tx.like.delete({
                    where: { id: existingLike.id },
                });
                await (0, counter_util_1.safeDecrementLikeCount)(tx, postId, 1);
                const updatedPost = await tx.post.findUnique({
                    where: { id: postId },
                    select: { likeCount: true },
                });
                return { liked: false, likeCount: updatedPost?.likeCount ?? 0 };
            }
            else {
                await tx.like.create({
                    data: {
                        userId,
                        postId,
                    },
                });
                const updatedPost = await tx.post.update({
                    where: { id: postId },
                    data: { likeCount: { increment: 1 } },
                });
                if (post.authorId) {
                    this.notificationsService
                        .create({
                        type: client_1.NotificationType.LIKE,
                        userId: post.authorId,
                        actorId: userId,
                        postId,
                    })
                        .catch((err) => {
                        this.logger.error('Failed to create like notification', err, 'PostsService');
                    });
                }
                return { liked: true, likeCount: updatedPost.likeCount };
            }
        });
    }
    async toggleBookmark(postId, userId) {
        return this.prisma.$transaction(async (tx) => {
            const post = await tx.post.findUnique({
                where: { id: postId },
            });
            if (!post) {
                throw new common_1.NotFoundException('게시글을 찾을 수 없습니다');
            }
            const existingBookmark = await tx.bookmark.findUnique({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
            });
            if (existingBookmark) {
                await tx.bookmark.delete({
                    where: { id: existingBookmark.id },
                });
                return { bookmarked: false };
            }
            else {
                await tx.bookmark.create({
                    data: {
                        userId,
                        postId,
                    },
                });
                return { bookmarked: true };
            }
        });
    }
    async getBookmarkStatus(postId, userId) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });
        return { bookmarked: !!bookmark };
    }
    async getLikeStatus(postId, userId) {
        const like = await this.prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });
        return { liked: !!like };
    }
    async downloadAttachment(postId, attachmentId) {
        const attachment = await this.prisma.postAttachment.findFirst({
            where: {
                id: attachmentId,
                postId,
            },
        });
        if (!attachment) {
            throw new common_1.NotFoundException('첨부파일을 찾을 수 없습니다');
        }
        await this.prisma.postAttachment.update({
            where: { id: attachmentId },
            data: { downloadCount: { increment: 1 } },
        });
        const buffer = await this.uploadsService.readMaterialFile(attachment.fileUrl);
        return {
            buffer,
            fileName: attachment.fileName,
            mimeType: attachment.mimeType,
        };
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => uploads_service_1.UploadsService))),
    __param(3, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        uploads_service_1.UploadsService, Object])
], PostsService);
//# sourceMappingURL=posts.service.js.map