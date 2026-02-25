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
exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const COMMON_PASSWORDS = [
    'password',
    '12345678',
    '123456789',
    'qwerty123',
    'password1',
    'iloveyou',
    'admin123',
    'welcome1',
    'monkey123',
    'dragon12',
    'master12',
    'letmein1',
    'sunshine',
    'princess',
    'football',
];
let IsNotCommonPassword = class IsNotCommonPassword {
    validate(password) {
        return !COMMON_PASSWORDS.includes(password?.toLowerCase());
    }
    defaultMessage() {
        return '일반적으로 사용되는 취약한 비밀번호는 사용할 수 없습니다';
    }
};
IsNotCommonPassword = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isNotCommonPassword', async: false })
], IsNotCommonPassword);
class RegisterDto {
    email;
    password;
    nickname;
    jobType;
    career;
    agreedTerms;
    agreedPrivacy;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com', description: '이메일 주소' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Password1!',
        description: '비밀번호 (8자 이상, 영문+숫자+특수문자)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.MaxLength)(100),
    (0, class_validator_1.Matches)(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/, {
        message: '비밀번호는 영문, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다',
    }),
    (0, class_validator_1.Validate)(IsNotCommonPassword),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '홍길동', description: '닉네임' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], RegisterDto.prototype, "nickname", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.JobType, description: '직종' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.JobType),
    __metadata("design:type", String)
], RegisterDto.prototype, "jobType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5, description: '경력 (년)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], RegisterDto.prototype, "career", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: '이용약관 동의 여부' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RegisterDto.prototype, "agreedTerms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: '개인정보처리방침 동의 여부' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RegisterDto.prototype, "agreedPrivacy", void 0);
//# sourceMappingURL=register.dto.js.map