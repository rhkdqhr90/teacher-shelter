"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentResponseDto = void 0;
class CommentResponseDto {
    id;
    content;
    author;
    mentionedUser;
    parentCommentId;
    replies;
    createdAt;
    updatedAt;
    constructor(comment) {
        this.id = comment.id;
        this.content = comment.content;
        this.parentCommentId = comment.parentCommentId;
        this.createdAt = comment.createdAt;
        this.updatedAt = comment.updatedAt;
        this.author = comment.author
            ? {
                id: comment.author.id,
                nickname: comment.author.nickname,
                profileImage: comment.author.profileImage,
            }
            : null;
        this.mentionedUser = comment.mentionedUser
            ? {
                id: comment.mentionedUser.id,
                nickname: comment.mentionedUser.nickname,
            }
            : null;
        if (comment.replies && !comment.parentCommentId) {
            this.replies = comment.replies.map((reply) => new CommentResponseDto(reply));
        }
    }
}
exports.CommentResponseDto = CommentResponseDto;
//# sourceMappingURL=comment-response.dto.js.map