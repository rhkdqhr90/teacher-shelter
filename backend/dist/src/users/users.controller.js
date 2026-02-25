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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const update_user_dto_1 = require("./dto/update-user.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
const delete_account_dto_1 = require("./dto/delete-account.dto");
const user_response_dto_1 = require("./dto/user-response.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
function sanitizePage(page) {
    const parsed = page ? parseInt(page, 10) : 1;
    return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
}
function sanitizeLimit(limit, defaultLimit = 20, maxLimit = 100) {
    const parsed = limit ? parseInt(limit, 10) : defaultLimit;
    if (Number.isNaN(parsed) || parsed < 1)
        return defaultLimit;
    return Math.min(parsed, maxLimit);
}
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getProfile(req) {
        const user = req.user;
        const profile = await this.usersService.findOne(user.sub);
        return new user_response_dto_1.UserResponseDto(profile);
    }
    async updateProfile(req, updateUserDto) {
        const user = req.user;
        const updatedUser = await this.usersService.update(user.sub, updateUserDto);
        return new user_response_dto_1.UserResponseDto(updatedUser);
    }
    async changePassword(req, changePasswordDto) {
        const user = req.user;
        await this.usersService.changePassword(user.sub, changePasswordDto);
    }
    async getMyPosts(req, page, limit) {
        const user = req.user;
        return this.usersService.getMyPosts(user.sub, {
            page: sanitizePage(page),
            limit: sanitizeLimit(limit),
        });
    }
    async getMyComments(req, page, limit) {
        const user = req.user;
        return this.usersService.getMyComments(user.sub, {
            page: sanitizePage(page),
            limit: sanitizeLimit(limit),
        });
    }
    async getMyBookmarks(req, page, limit) {
        const user = req.user;
        return this.usersService.getMyBookmarks(user.sub, {
            page: sanitizePage(page),
            limit: sanitizeLimit(limit),
        });
    }
    async getMyLikes(req, page, limit) {
        const user = req.user;
        return this.usersService.getMyLikes(user.sub, {
            page: sanitizePage(page),
            limit: sanitizeLimit(limit),
        });
    }
    async searchUsers(query, limit) {
        return this.usersService.searchUsers(query || '', sanitizeLimit(limit, 10, 20));
    }
    async getDashboardStats(req) {
        const user = req.user;
        return this.usersService.getDashboardStats(user.sub);
    }
    async getRecentActivity(req, limit) {
        const user = req.user;
        return this.usersService.getRecentActivity(user.sub, sanitizeLimit(limit, 5, 20));
    }
    async deleteAccount(req, deleteAccountDto) {
        const user = req.user;
        await this.usersService.remove(user.sub, deleteAccountDto.password);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({
        summary: '내 프로필 조회',
        description: '로그인한 사용자의 프로필을 조회합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '프로필 조회 성공',
        type: user_response_dto_1.UserResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, throttler_1.Throttle)({ default: { ttl: 60000, limit: 10 } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)('me/password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, throttler_1.Throttle)({ default: { ttl: 60000, limit: 3 } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('me/posts'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyPosts", null);
__decorate([
    (0, common_1.Get)('me/comments'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyComments", null);
__decorate([
    (0, common_1.Get)('me/bookmarks'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyBookmarks", null);
__decorate([
    (0, common_1.Get)('me/likes'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyLikes", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, throttler_1.Throttle)({ default: { ttl: 60000, limit: 30 } }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "searchUsers", null);
__decorate([
    (0, common_1.Get)('me/dashboard-stats'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('me/recent-activity'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getRecentActivity", null);
__decorate([
    (0, common_1.Delete)('me'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, throttler_1.Throttle)({ default: { ttl: 60000, limit: 2 } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, delete_account_dto_1.DeleteAccountDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteAccount", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map