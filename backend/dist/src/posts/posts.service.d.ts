import type { LoggerService } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDto, PaginatedResponse } from './dto/pagination.dto';
import { PostResponseDto } from './dto/post-response.dto';
export declare class PostsService {
    private prisma;
    private notificationsService;
    private uploadsService;
    private readonly logger;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, uploadsService: UploadsService, logger: LoggerService);
    create(userId: string, createPostDto: CreatePostDto, ip: string): Promise<PostResponseDto>;
    findAll(pagination: PaginationDto): Promise<PaginatedResponse<PostResponseDto>>;
    findOne(id: string, ip: string): Promise<PostResponseDto>;
    update(id: string, userId: string, updatePostDto: UpdatePostDto): Promise<PostResponseDto>;
    remove(id: string, userId: string, ip: string): Promise<void>;
    private deletePostImages;
    getHotPosts(limit?: number): Promise<PostResponseDto[]>;
    getCategoryPreviews(categories: string[], limit?: number): Promise<{
        category: string;
        posts: {
            id: string;
            createdAt: Date;
            title: string;
            category: import("@prisma/client").$Enums.PostCategory;
            isAnonymous: boolean;
            viewCount: number;
            likeCount: number;
            commentCount: number;
            author: {
                id: string;
                nickname: string;
                isVerified: boolean;
            } | null;
        }[];
    }[]>;
    toggleLike(postId: string, userId: string): Promise<{
        liked: boolean;
        likeCount: number;
    }>;
    toggleBookmark(postId: string, userId: string): Promise<{
        bookmarked: boolean;
    }>;
    getBookmarkStatus(postId: string, userId: string): Promise<{
        bookmarked: boolean;
    }>;
    getLikeStatus(postId: string, userId: string): Promise<{
        liked: boolean;
    }>;
}
