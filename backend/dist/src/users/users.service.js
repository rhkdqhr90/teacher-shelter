"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const counter_util_1 = require("../common/utils/counter.util");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    SALT_ROUNDS = 10;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                nickname: true,
                role: true,
                provider: true,
                providerId: true,
                isVerified: true,
                jobType: true,
                career: true,
                profileImage: true,
                isExpert: true,
                expertType: true,
                expertVerifiedAt: true,
                lastLoginAt: true,
                isBanned: true,
                bannedAt: true,
                bannedUntil: true,
                banReason: true,
                termsAgreedAt: true,
                privacyAgreedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('사용자를 찾을 수 없습니다');
        }
        return user;
    }
    async findOneWithPassword(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('사용자를 찾을 수 없습니다');
        }
        return user;
    }
    async update(id, updateUserDto) {
        await this.findOne(id);
        if (updateUserDto.email) {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: updateUserDto.email },
            });
            if (existingUser && existingUser.id !== id) {
                throw new common_1.ConflictException('이미 사용 중인 이메일입니다');
            }
            const userWithPassword = await this.findOneWithPassword(id);
            if (userWithPassword.password && updateUserDto.currentPassword) {
                const isPasswordValid = await bcrypt.compare(updateUserDto.currentPassword, userWithPassword.password);
                if (!isPasswordValid) {
                    throw new common_1.UnauthorizedException('현재 비밀번호가 올바르지 않습니다');
                }
            }
            else if (userWithPassword.password && !updateUserDto.currentPassword) {
                throw new common_1.UnauthorizedException('이메일 변경 시 현재 비밀번호가 필요합니다');
            }
        }
        const { currentPassword: _, ...updateData } = updateUserDto;
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                ...updateData,
                ...(updateUserDto.email && { isVerified: false }),
            },
            select: {
                id: true,
                email: true,
                nickname: true,
                role: true,
                provider: true,
                providerId: true,
                isVerified: true,
                jobType: true,
                career: true,
                profileImage: true,
                isExpert: true,
                expertType: true,
                expertVerifiedAt: true,
                lastLoginAt: true,
                isBanned: true,
                bannedAt: true,
                bannedUntil: true,
                banReason: true,
                termsAgreedAt: true,
                privacyAgreedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return updatedUser;
    }
    async changePassword(id, changePasswordDto) {
        const user = await this.findOneWithPassword(id);
        if (!user.password) {
            throw new common_1.UnauthorizedException('소셜 로그인 계정은 비밀번호를 변경할 수 없습니다');
        }
        const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('현재 비밀번호가 올바르지 않습니다');
        }
        const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, this.SALT_ROUNDS);
        const accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id },
                data: { password: hashedPassword },
            }),
            this.prisma.refreshToken.updateMany({
                where: {
                    userId: id,
                    revokedAt: null,
                },
                data: {
                    revokedAt: new Date(),
                },
            }),
            this.prisma.tokenBlacklist.create({
                data: {
                    userId: id,
                    expiresAt: accessTokenExpiry,
                    reason: 'password_change',
                },
            }),
        ]);
    }
    async getMyPosts(id, options = {}) {
        const { page = 1, limit = 20 } = options;
        const skip = (page - 1) * limit;
        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where: { authorId: id },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: {
                        select: {
                            id: true,
                            nickname: true,
                            jobType: true,
                            career: true,
                            isVerified: true,
                        },
                    },
                    _count: {
                        select: { comments: true, likes: true },
                    },
                },
            }),
            this.prisma.post.count({ where: { authorId: id } }),
        ]);
        return {
            data: posts.map((post) => ({
                ...post,
                likeCount: post._count.likes,
                commentCount: post._count.comments,
                _count: undefined,
            })),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getMyComments(id, options = {}) {
        const { page = 1, limit = 20 } = options;
        const skip = (page - 1) * limit;
        const [comments, total] = await Promise.all([
            this.prisma.comment.findMany({
                where: { authorId: id },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    post: {
                        select: {
                            id: true,
                            title: true,
                            category: true,
                        },
                    },
                },
            }),
            this.prisma.comment.count({ where: { authorId: id } }),
        ]);
        return {
            data: comments,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getMyBookmarks(id, options = {}) {
        const { page = 1, limit = 20 } = options;
        const skip = (page - 1) * limit;
        const [bookmarks, total] = await Promise.all([
            this.prisma.bookmark.findMany({
                where: { userId: id },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    post: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    nickname: true,
                                    jobType: true,
                                    career: true,
                                    isVerified: true,
                                },
                            },
                            _count: {
                                select: { comments: true, likes: true },
                            },
                        },
                    },
                },
            }),
            this.prisma.bookmark.count({ where: { userId: id } }),
        ]);
        return {
            data: bookmarks.map((bookmark) => ({
                id: bookmark.post.id,
                title: bookmark.post.title,
                content: bookmark.post.content,
                category: bookmark.post.category,
                isAnonymous: bookmark.post.isAnonymous,
                viewCount: bookmark.post.viewCount,
                likeCount: bookmark.post._count.likes,
                commentCount: bookmark.post._count.comments,
                createdAt: bookmark.post.createdAt,
                author: bookmark.post.author,
                bookmarkedAt: bookmark.createdAt,
            })),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getMyLikes(id, options = {}) {
        const { page = 1, limit = 20 } = options;
        const skip = (page - 1) * limit;
        const [likes, total] = await Promise.all([
            this.prisma.like.findMany({
                where: { userId: id },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    post: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    nickname: true,
                                    jobType: true,
                                    career: true,
                                    isVerified: true,
                                },
                            },
                            _count: {
                                select: { comments: true, likes: true },
                            },
                        },
                    },
                },
            }),
            this.prisma.like.count({ where: { userId: id } }),
        ]);
        return {
            data: likes.map((like) => ({
                id: like.post.id,
                title: like.post.title,
                content: like.post.content,
                category: like.post.category,
                isAnonymous: like.post.isAnonymous,
                viewCount: like.post.viewCount,
                likeCount: like.post._count.likes,
                commentCount: like.post._count.comments,
                createdAt: like.post.createdAt,
                author: like.post.author,
                likedAt: like.createdAt,
            })),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async searchUsers(query, limit = 10) {
        if (!query || query.length < 1) {
            return [];
        }
        const safeLimit = Math.min(Math.max(1, limit), 20);
        const users = await this.prisma.user.findMany({
            where: {
                nickname: {
                    contains: query,
                    mode: 'insensitive',
                },
            },
            select: {
                id: true,
                nickname: true,
                isVerified: true,
                jobType: true,
            },
            take: safeLimit,
            orderBy: {
                nickname: 'asc',
            },
        });
        return users;
    }
    async getDashboardStats(userId) {
        const [postCount, commentCount, likeCount, bookmarkCount] = await Promise.all([
            this.prisma.post.count({ where: { authorId: userId } }),
            this.prisma.comment.count({ where: { authorId: userId } }),
            this.prisma.like.count({
                where: {
                    post: { authorId: userId },
                },
            }),
            this.prisma.bookmark.count({ where: { userId } }),
        ]);
        return {
            postCount,
            commentCount,
            receivedLikeCount: likeCount,
            bookmarkCount,
        };
    }
    async getRecentActivity(userId, limit = 5) {
        const [recentPosts, recentComments] = await Promise.all([
            this.prisma.post.findMany({
                where: { authorId: userId },
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    category: true,
                    createdAt: true,
                    _count: {
                        select: { comments: true, likes: true },
                    },
                },
            }),
            this.prisma.comment.findMany({
                where: { authorId: userId },
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    post: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
            }),
        ]);
        return {
            recentPosts: recentPosts.map((post) => ({
                ...post,
                likeCount: post._count.likes,
                commentCount: post._count.comments,
                _count: undefined,
            })),
            recentComments,
        };
    }
    async remove(id, password) {
        const user = await this.findOneWithPassword(id);
        if (user.password) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('비밀번호가 올바르지 않습니다');
            }
        }
        await this.prisma.$transaction(async (tx) => {
            const userComments = await tx.comment.findMany({
                where: { authorId: id },
                select: { id: true, postId: true, parentCommentId: true },
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
                where: { userId: id },
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
                where: { id },
            });
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map