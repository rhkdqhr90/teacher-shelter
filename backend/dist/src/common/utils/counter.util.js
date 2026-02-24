"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeDecrementCommentCount = safeDecrementCommentCount;
exports.safeDecrementLikeCount = safeDecrementLikeCount;
async function safeDecrementCommentCount(tx, postId, decrementBy) {
    await tx.$executeRaw `
    UPDATE "Post"
    SET "commentCount" = GREATEST(0, "commentCount" - ${decrementBy})
    WHERE "id" = ${postId}
  `;
}
async function safeDecrementLikeCount(tx, postId, decrementBy) {
    await tx.$executeRaw `
    UPDATE "Post"
    SET "likeCount" = GREATEST(0, "likeCount" - ${decrementBy})
    WHERE "id" = ${postId}
  `;
}
//# sourceMappingURL=counter.util.js.map