"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResponseDto = void 0;
class PostResponseDto {
    id;
    title;
    content;
    category;
    isAnonymous;
    viewCount;
    likeCount;
    commentCount;
    author;
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
    attachments;
    createdAt;
    updatedAt;
    constructor(post) {
        this.id = post.id;
        this.title = post.title;
        this.content = post.content;
        this.category = post.category;
        this.isAnonymous = post.isAnonymous;
        this.viewCount = post.viewCount;
        this.likeCount = post.likeCount;
        this.commentCount = post.commentCount;
        this.createdAt = post.createdAt;
        this.updatedAt = post.updatedAt;
        this.jobSubCategory = post.jobSubCategory;
        this.region = post.region;
        this.salaryType = post.salaryType;
        this.salaryMin = post.salaryMin;
        this.salaryMax = post.salaryMax;
        this.isRecruiting = post.isRecruiting;
        this.organizationName = post.organizationName;
        this.contactPhone = post.contactPhone;
        this.contactEmail = post.contactEmail;
        this.contactKakao = post.contactKakao;
        this.deadline = post.deadline;
        this.isAutoClose = post.isAutoClose;
        this.recruitCount = post.recruitCount;
        this.workingHours = post.workingHours;
        this.employmentType = post.employmentType;
        this.benefits = post.benefits;
        this.requirements = post.requirements;
        this.detailAddress = post.detailAddress;
        this.therapyTags = post.therapyTags || [];
        if (post.isAnonymous || !post.author) {
            this.author = null;
        }
        else {
            this.author = {
                id: post.author.id,
                nickname: post.author.nickname,
                profileImage: post.author.profileImage,
                jobType: post.author.jobType,
                career: post.author.career,
                isVerified: post.author.isVerified,
            };
        }
        this.attachments = (post.attachments || []).map((att) => ({
            id: att.id,
            fileUrl: att.fileUrl,
            fileName: att.fileName,
            fileSize: att.fileSize,
            mimeType: att.mimeType,
            downloadCount: att.downloadCount,
        }));
    }
}
exports.PostResponseDto = PostResponseDto;
//# sourceMappingURL=post-response.dto.js.map