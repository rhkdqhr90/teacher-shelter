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
exports.ResetPasswordDto = void 0;
const class_validator_1 = require("class-validator");
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
class ResetPasswordDto {
    token;
    newPassword;
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: '토큰이 필요합니다' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: '비밀번호는 최소 8자 이상이어야 합니다' }),
    (0, class_validator_1.MaxLength)(100, { message: '비밀번호는 최대 100자까지입니다' }),
    (0, class_validator_1.Matches)(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/, {
        message: '비밀번호는 영문, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다',
    }),
    (0, class_validator_1.Validate)(IsNotCommonPassword),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
//# sourceMappingURL=reset-password.dto.js.map