import { StreamableFile } from '@nestjs/common';
import type { Request, Response } from 'express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDto } from './dto/pagination.dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    create(req: Request, createPostDto: CreatePostDto): Promise<import("./dto/post-response.dto").PostResponseDto>;
    findAll(pagination: PaginationDto): Promise<import("./dto/pagination.dto").PaginatedResponse<import("./dto/post-response.dto").PostResponseDto>>;
    getHotPosts(): Promise<import("./dto/post-response.dto").PostResponseDto[]>;
    getCategoryPreviews(categories: string, limit?: string): Promise<{
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
    findOne(id: string, req: Request): Promise<import("./dto/post-response.dto").PostResponseDto>;
    update(id: string, req: Request, updatePostDto: UpdatePostDto): Promise<import("./dto/post-response.dto").PostResponseDto>;
    remove(id: string, req: Request): Promise<void>;
    toggleLike(id: string, req: Request): Promise<{
        liked: boolean;
        likeCount: number;
    }>;
    toggleBookmark(id: string, req: Request): Promise<{
        bookmarked: boolean;
    }>;
    getBookmarkStatus(id: string, req: Request): Promise<{
        bookmarked: boolean;
    }>;
    getLikeStatus(id: string, req: Request): Promise<{
        liked: boolean;
    }>;
    downloadAttachment(id: string, attachmentId: string, res: Response): Promise<StreamableFile>;
}
