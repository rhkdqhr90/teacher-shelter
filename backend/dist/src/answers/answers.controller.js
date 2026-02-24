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
exports.AnswersController = void 0;
const common_1 = require("@nestjs/common");
const answers_service_1 = require("./answers.service");
const create_answer_dto_1 = require("./dto/create-answer.dto");
const update_answer_dto_1 = require("./dto/update-answer.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let AnswersController = class AnswersController {
    answersService;
    constructor(answersService) {
        this.answersService = answersService;
    }
    async findAll(postId) {
        return this.answersService.findByPostId(postId);
    }
    async create(postId, req, createAnswerDto) {
        const user = req.user;
        return this.answersService.create(postId, user.sub, createAnswerDto);
    }
    async update(answerId, req, updateAnswerDto) {
        const user = req.user;
        return this.answersService.update(answerId, user.sub, updateAnswerDto);
    }
    async remove(answerId, req) {
        const user = req.user;
        const isAdmin = user.role === 'ADMIN';
        await this.answersService.remove(answerId, user.sub, isAdmin);
    }
    async selectBest(answerId, req) {
        const user = req.user;
        return this.answersService.selectBest(answerId, user.sub);
    }
};
exports.AnswersController = AnswersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnswersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_answer_dto_1.CreateAnswerDto]),
    __metadata("design:returntype", Promise)
], AnswersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':answerId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('answerId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_answer_dto_1.UpdateAnswerDto]),
    __metadata("design:returntype", Promise)
], AnswersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':answerId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('answerId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnswersController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':answerId/best'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('answerId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnswersController.prototype, "selectBest", null);
exports.AnswersController = AnswersController = __decorate([
    (0, common_1.Controller)('posts/:postId/answers'),
    __metadata("design:paramtypes", [answers_service_1.AnswersService])
], AnswersController);
//# sourceMappingURL=answers.controller.js.map