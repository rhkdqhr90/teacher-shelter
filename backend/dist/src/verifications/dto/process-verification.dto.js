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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessVerificationDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const sanitize_util_1 = require("../../common/utils/sanitize.util");
class ProcessVerificationDto {
    status;
    rejectionReason;
}
exports.ProcessVerificationDto = ProcessVerificationDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.VerificationStatus, { message: '유효하지 않은 상태입니다' }),
    __metadata("design:type", String)
], ProcessVerificationDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500, { message: '반려 사유는 최대 500자까지 입력 가능합니다' }),
    (0, class_transformer_1.Transform)(sanitize_util_1.sanitizeTitle),
    __metadata("design:type", String)
], ProcessVerificationDto.prototype, "rejectionReason", void 0);
//# sourceMappingURL=process-verification.dto.js.map