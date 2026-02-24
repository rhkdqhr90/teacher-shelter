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
exports.VerificationsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const verifications_service_1 = require("./verifications.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_verification_request_dto_1 = require("./dto/create-verification-request.dto");
let VerificationsController = class VerificationsController {
    verificationsService;
    constructor(verificationsService) {
        this.verificationsService = verificationsService;
    }
    async create(req, dto, file) {
        if (!file) {
            throw new common_1.BadRequestException('인증 서류 파일을 첨부해주세요');
        }
        const user = req.user;
        return this.verificationsService.create(user.sub, dto, file);
    }
    getMyRequests(req) {
        const user = req.user;
        return this.verificationsService.findMyRequests(user.sub);
    }
    async getMyStatus(req) {
        const user = req.user;
        return this.verificationsService.getMyLatestStatus(user.sub);
    }
};
exports.VerificationsController = VerificationsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_verification_request_dto_1.CreateVerificationRequestDto, Object]),
    __metadata("design:returntype", Promise)
], VerificationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VerificationsController.prototype, "getMyRequests", null);
__decorate([
    (0, common_1.Get)('my/status'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VerificationsController.prototype, "getMyStatus", null);
exports.VerificationsController = VerificationsController = __decorate([
    (0, common_1.Controller)('verifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [verifications_service_1.VerificationsService])
], VerificationsController);
//# sourceMappingURL=verifications.controller.js.map