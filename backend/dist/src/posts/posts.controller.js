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
exports.PostsController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const swagger_1 = require("@nestjs/swagger");
const posts_service_1 = require("./posts.service");
const create_post_dto_1 = require("./dto/create-post.dto");
const update_post_dto_1 = require("./dto/update-post.dto");
const pagination_dto_1 = require("./dto/pagination.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
function isValidIPv4(ip) {
    const cleanIp = ip.replace(/^::ffff:/i, '');
    const parts = cleanIp.split('.');
    if (parts.length !== 4)
        return false;
    return parts.every((part) => {
        const num = parseInt(part, 10);
        return !isNaN(num) && num >= 0 && num <= 255 && part === String(num);
    });
}
function isValidIPv6(ip) {
    if (ip.toLowerCase().startsWith('::ffff:')) {
        return isValidIPv4(ip);
    }
    const doubleColonCount = (ip.match(/::/g) || []).length;
    if (doubleColonCount > 1)
        return false;
    let expanded = ip;
    if (ip.includes('::')) {
        const parts = ip.split('::');
        const left = parts[0] ? parts[0].split(':') : [];
        const right = parts[1] ? parts[1].split(':') : [];
        const missing = 8 - left.length - right.length;
        if (missing < 0)
            return false;
        const middle = Array(missing).fill('0');
        expanded = [...left, ...middle, ...right].join(':');
    }
    const segments = expanded.split(':');
    if (segments.length !== 8)
        return false;
    return segments.every((seg) => {
        if (seg.length === 0 || seg.length > 4)
            return false;
        return /^[0-9a-fA-F]+$/.test(seg);
    });
}
function getClientIp(req) {
    const ip = req.ip;
    if (!ip) {
        return '0.0.0.0';
    }
    if (ip.includes('.')) {
        if (isValidIPv4(ip)) {
            return ip;
        }
        return '0.0.0.0';
    }
    if (isValidIPv6(ip)) {
        return ip;
    }
    return '0.0.0.0';
}
let PostsController = class PostsController {
    postsService;
    constructor(postsService) {
        this.postsService = postsService;
    }
    async create(req, createPostDto) {
        const user = req.user;
        const ip = getClientIp(req);
        return this.postsService.create(user.sub, createPostDto, ip);
    }
    async findAll(pagination) {
        return this.postsService.findAll(pagination);
    }
    async getHotPosts() {
        return this.postsService.getHotPosts();
    }
    async getCategoryPreviews(categories, limit) {
        const categoryList = categories ? categories.split(',') : [];
        const parsedLimit = limit ? parseInt(limit, 10) : 3;
        return this.postsService.getCategoryPreviews(categoryList, parsedLimit);
    }
    async findOne(id, req) {
        const ip = getClientIp(req);
        return this.postsService.findOne(id, ip);
    }
    async update(id, req, updatePostDto) {
        const user = req.user;
        return this.postsService.update(id, user.sub, updatePostDto);
    }
    async remove(id, req) {
        const user = req.user;
        const ip = getClientIp(req);
        await this.postsService.remove(id, user.sub, ip);
    }
    async toggleLike(id, req) {
        const user = req.user;
        return this.postsService.toggleLike(id, user.sub);
    }
    async toggleBookmark(id, req) {
        const user = req.user;
        return this.postsService.toggleBookmark(id, user.sub);
    }
    async getBookmarkStatus(id, req) {
        const user = req.user;
        return this.postsService.getBookmarkStatus(id, user.sub);
    }
    async getLikeStatus(id, req) {
        const user = req.user;
        return this.postsService.getLikeStatus(id, user.sub);
    }
    async downloadAttachment(id, attachmentId, res) {
        const { buffer, fileName, mimeType } = await this.postsService.downloadAttachment(id, attachmentId);
        const encodedFileName = encodeURIComponent(fileName);
        res.set({
            'Content-Type': mimeType,
            'Content-Disposition': `attachment; filename*=UTF-8''${encodedFileName}`,
        });
        return new common_1.StreamableFile(buffer);
    }
};
exports.PostsController = PostsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_post_dto_1.CreatePostDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('hot'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getHotPosts", null);
__decorate([
    (0, common_1.Get)('category-previews'),
    __param(0, (0, common_1.Query)('categories')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getCategoryPreviews", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, throttler_1.Throttle)({ default: { limit: 20, ttl: 60000 } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_post_dto_1.UpdatePostDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/like'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.Throttle)({ default: { limit: 30, ttl: 60000 } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "toggleLike", null);
__decorate([
    (0, common_1.Post)(':id/bookmark'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.Throttle)({ default: { limit: 30, ttl: 60000 } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "toggleBookmark", null);
__decorate([
    (0, common_1.Get)(':id/bookmark'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getBookmarkStatus", null);
__decorate([
    (0, common_1.Get)(':id/like'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getLikeStatus", null);
__decorate([
    (0, common_1.Get)(':id/attachments/:attachmentId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('attachmentId')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "downloadAttachment", null);
exports.PostsController = PostsController = __decorate([
    (0, swagger_1.ApiTags)('Posts'),
    (0, common_1.Controller)('posts'),
    __metadata("design:paramtypes", [posts_service_1.PostsService])
], PostsController);
//# sourceMappingURL=posts.controller.js.map