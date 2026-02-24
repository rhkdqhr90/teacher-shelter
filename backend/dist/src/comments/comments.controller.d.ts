import type { Request } from 'express';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
declare class CommentPaginationDto {
    page: number;
    limit: number;
}
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    create(postId: string, req: Request, createCommentDto: CreateCommentDto): Promise<import("./dto/comment-response.dto").CommentResponseDto>;
    findAllByPost(postId: string, pagination: CommentPaginationDto): Promise<{
        data: import("./dto/comment-response.dto").CommentResponseDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    update(id: string, req: Request, updateCommentDto: UpdateCommentDto): Promise<import("./dto/comment-response.dto").CommentResponseDto>;
    remove(id: string, req: Request): Promise<void>;
}
export {};
