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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const orphan_cleanup_service_1 = require("../uploads/orphan-cleanup.service");
const uploads_service_1 = require("../uploads/uploads.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const update_report_dto_1 = require("../reports/dto/update-report.dto");
const update_user_role_dto_1 = require("./dto/update-user-role.dto");
const bulk_delete_posts_dto_1 = require("./dto/bulk-delete-posts.dto");
const process_verification_dto_1 = require("../verifications/dto/process-verification.dto");
const client_1 = require("@prisma/client");
const MAX_LIMIT = 100;
function parseLimit(limit, defaultValue = 20) {
    const parsed = limit ? parseInt(limit, 10) : defaultValue;
    return Math.min(Math.max(1, parsed), MAX_LIMIT);
}
function parsePage(page) {
    const parsed = page ? parseInt(page, 10) : 1;
    return Math.max(1, parsed);
}
let AdminController = class AdminController {
    adminService;
    orphanCleanupService;
    uploadsService;
    constructor(adminService, orphanCleanupService, uploadsService) {
        this.adminService = adminService;
        this.orphanCleanupService = orphanCleanupService;
        this.uploadsService = uploadsService;
    }
    async getStats() {
        return this.adminService.getStats();
    }
    async getReports(page, limit, status, type) {
        return this.adminService.getReports(parsePage(page), parseLimit(limit), status, type);
    }
    async getReport(id) {
        return this.adminService.getReport(id);
    }
    async processReport(id, req, dto) {
        const admin = req.user;
        return this.adminService.processReport(id, admin.sub, dto);
    }
    async getUsers(page, limit, search, role) {
        return this.adminService.getUsers(parsePage(page), parseLimit(limit), search, role);
    }
    async updateUserRole(id, req, dto) {
        const admin = req.user;
        return this.adminService.updateUserRole(id, dto.role, admin.sub);
    }
    async deleteUser(id) {
        return this.adminService.deleteUser(id);
    }
    async getPosts(page, limit, search, category) {
        return this.adminService.getPosts(parsePage(page), parseLimit(limit), search, category);
    }
    async deletePost(id) {
        return this.adminService.deletePost(id);
    }
    async bulkDeletePosts(dto) {
        return this.adminService.bulkDeletePosts(dto.ids);
    }
    async deleteComment(id) {
        return this.adminService.deleteComment(id);
    }
    async cleanupOrphanFiles() {
        const result = await this.orphanCleanupService.cleanupOrphanFiles();
        return {
            message: `고아 파일 정리 완료: ${result.deleted}개 삭제, ${result.errors}개 오류`,
            ...result,
        };
    }
    async getVerifications(page, limit, status) {
        return this.adminService.getVerifications(parsePage(page), parseLimit(limit), status);
    }
    async getVerification(id) {
        return this.adminService.getVerification(id);
    }
    async processVerification(id, req, dto) {
        const admin = req.user;
        return this.adminService.processVerification(id, admin.sub, dto);
    }
    async downloadVerificationFile(id, req, res) {
        const admin = req.user;
        const verification = await this.adminService.getVerification(id);
        await this.adminService.logVerificationAccess(id, admin.sub, 'VIEW', req.ip || req.socket?.remoteAddress, req.headers['user-agent']);
        const fileBuffer = await this.uploadsService.readVerificationFile(verification.fileUrl, verification.isEncrypted);
        res.setHeader('Content-Type', verification.fileType);
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(verification.originalFileName)}"`);
        res.setHeader('Content-Length', fileBuffer.length);
        res.send(fileBuffer);
    }
    async getVerificationAccessLogs(id) {
        await this.adminService.getVerification(id);
        return this.adminService.getVerificationAccessLogs(id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('reports'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getReports", null);
__decorate([
    (0, common_1.Get)('reports/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getReport", null);
__decorate([
    (0, common_1.Patch)('reports/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_report_dto_1.UpdateReportDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "processReport", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id/role'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_user_role_dto_1.UpdateUserRoleDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('posts'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPosts", null);
__decorate([
    (0, common_1.Delete)('posts/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deletePost", null);
__decorate([
    (0, common_1.Post)('posts/bulk-delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_delete_posts_dto_1.BulkDeletePostsDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "bulkDeletePosts", null);
__decorate([
    (0, common_1.Delete)('comments/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteComment", null);
__decorate([
    (0, common_1.Post)('cleanup-orphan-files'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "cleanupOrphanFiles", null);
__decorate([
    (0, common_1.Get)('verifications'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getVerifications", null);
__decorate([
    (0, common_1.Get)('verifications/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getVerification", null);
__decorate([
    (0, common_1.Patch)('verifications/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, process_verification_dto_1.ProcessVerificationDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "processVerification", null);
__decorate([
    (0, common_1.Get)('verifications/:id/file'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "downloadVerificationFile", null);
__decorate([
    (0, common_1.Get)('verifications/:id/logs'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getVerificationAccessLogs", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, throttler_1.Throttle)({ default: { limit: 100, ttl: 60000 } }),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        orphan_cleanup_service_1.OrphanCleanupService,
        uploads_service_1.UploadsService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map