import { Comment } from '@prisma/client';
export type CommentWithRelations = Comment & {
    author?: {
        id: string;
        nickname: string;
        profileImage: string | null;
    } | null;
    mentionedUser?: {
        id: string;
        nickname: string;
    } | null;
    replies?: CommentWithRelations[];
};
export declare class CommentResponseDto {
    id: string;
    content: string;
    author: {
        id: string;
        nickname: string;
        profileImage: string | null;
    } | null;
    mentionedUser: {
        id: string;
        nickname: string;
    } | null;
    parentCommentId: string | null;
    replies?: CommentResponseDto[];
    createdAt: Date;
    updatedAt: Date;
    constructor(comment: CommentWithRelations);
}
