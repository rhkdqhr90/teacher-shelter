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
exports.UpdatePostDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const sanitize_util_1 = require("../../common/utils/sanitize.util");
class UpdatePostDto {
    title;
    content;
    category;
    jobSubCategory;
    region;
    salaryType;
    salaryMin;
    salaryMax;
    isRecruiting;
    organizationName;
    contactPhone;
    contactEmail;
    contactKakao;
    deadline;
    isAutoClose;
    recruitCount;
    workingHours;
    employmentType;
    benefits;
    requirements;
    detailAddress;
    therapyTags;
}
exports.UpdatePostDto = UpdatePostDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(200),
    (0, class_transformer_1.Transform)(sanitize_util_1.sanitizeTitle),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(10000),
    (0, class_transformer_1.Transform)(sanitize_util_1.sanitizeContent),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.PostCategory),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.JobSubCategory),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.category === client_1.PostCategory.JOB_POSTING),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "jobSubCategory", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.Region),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.category === client_1.PostCategory.JOB_POSTING),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "region", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.SalaryType),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.category === client_1.PostCategory.JOB_POSTING),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "salaryType", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.category === client_1.PostCategory.JOB_POSTING && o.salaryType !== client_1.SalaryType.NEGOTIABLE),
    __metadata("design:type", Number)
], UpdatePostDto.prototype, "salaryMin", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.category === client_1.PostCategory.JOB_POSTING && o.salaryType !== client_1.SalaryType.NEGOTIABLE),
    __metadata("design:type", Number)
], UpdatePostDto.prototype, "salaryMax", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.category === client_1.PostCategory.JOB_POSTING),
    __metadata("design:type", Boolean)
], UpdatePostDto.prototype, "isRecruiting", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.category === client_1.PostCategory.JOB_POSTING),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "organizationName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.category === client_1.PostCategory.JOB_POSTING),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "contactPhone", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.category === client_1.PostCategory.JOB_POSTING),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "contactEmail", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.category === client_1.PostCategory.JOB_POSTING),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "contactKakao", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.category === client_1.PostCategory.JOB_POSTING),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "deadline", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdatePostDto.prototype, "isAutoClose", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.category === client_1.PostCategory.JOB_POSTING),
    __metadata("design:type", Number)
], UpdatePostDto.prototype, "recruitCount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.category === client_1.PostCategory.JOB_POSTING),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "workingHours", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.EmploymentType),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.category === client_1.PostCategory.JOB_POSTING),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "employmentType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.category === client_1.PostCategory.JOB_POSTING),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "benefits", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.category === client_1.PostCategory.JOB_POSTING),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "requirements", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.category === client_1.PostCategory.JOB_POSTING),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "detailAddress", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(client_1.TherapyTag, { each: true }),
    (0, class_validator_1.ArrayMaxSize)(8, { message: '태그는 최대 8개까지 선택 가능합니다' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.category === client_1.PostCategory.JOB_POSTING),
    __metadata("design:type", Array)
], UpdatePostDto.prototype, "therapyTags", void 0);
//# sourceMappingURL=update-post.dto.js.map