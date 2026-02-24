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
exports.CreateVerificationRequestDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const sanitize_util_1 = require("../../common/utils/sanitize.util");
class CreateVerificationRequestDto {
    verificationType;
    note;
}
exports.CreateVerificationRequestDto = CreateVerificationRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: '인증 유형은 최소 2자 이상 입력해주세요' }),
    (0, class_validator_1.MaxLength)(50, { message: '인증 유형은 최대 50자까지 입력 가능합니다' }),
    (0, class_transformer_1.Transform)(sanitize_util_1.sanitizeTitle),
    __metadata("design:type", String)
], CreateVerificationRequestDto.prototype, "verificationType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500, { message: '메모는 최대 500자까지 입력 가능합니다' }),
    (0, class_transformer_1.Transform)(sanitize_util_1.sanitizeTitle),
    __metadata("design:type", String)
], CreateVerificationRequestDto.prototype, "note", void 0);
//# sourceMappingURL=create-verification-request.dto.js.map