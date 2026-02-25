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
exports.BulkDeletePostsDto = void 0;
const class_validator_1 = require("class-validator");
class BulkDeletePostsDto {
    ids;
}
exports.BulkDeletePostsDto = BulkDeletePostsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: '삭제할 게시글을 선택해주세요' }),
    (0, class_validator_1.ArrayMaxSize)(100, { message: '한 번에 최대 100개까지 삭제할 수 있습니다' }),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.Matches)(/^c[a-z0-9]{24,}$/i, {
        each: true,
        message: '유효하지 않은 게시글 ID입니다',
    }),
    __metadata("design:type", Array)
], BulkDeletePostsDto.prototype, "ids", void 0);
//# sourceMappingURL=bulk-delete-posts.dto.js.map