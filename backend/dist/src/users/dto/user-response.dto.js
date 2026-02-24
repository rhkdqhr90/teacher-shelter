"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResponseDto = void 0;
class UserResponseDto {
    id;
    email;
    nickname;
    role;
    provider;
    isVerified;
    jobType;
    career;
    profileImage;
    isExpert;
    expertType;
    expertVerifiedAt;
    lastLoginAt;
    isBanned;
    bannedAt;
    bannedUntil;
    banReason;
    createdAt;
    updatedAt;
    constructor(user) {
        this.id = user.id;
        this.email = user.email;
        this.nickname = user.nickname;
        this.role = user.role;
        this.provider = user.provider || 'local';
        this.isVerified = user.isVerified;
        this.jobType = user.jobType;
        this.career = user.career;
        this.profileImage = user.profileImage;
        this.isExpert = user.isExpert;
        this.expertType = user.expertType;
        this.expertVerifiedAt = user.expertVerifiedAt;
        this.lastLoginAt = user.lastLoginAt;
        this.isBanned = user.isBanned;
        this.bannedAt = user.bannedAt;
        this.bannedUntil = user.bannedUntil;
        this.banReason = user.banReason;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
    }
}
exports.UserResponseDto = UserResponseDto;
//# sourceMappingURL=user-response.dto.js.map