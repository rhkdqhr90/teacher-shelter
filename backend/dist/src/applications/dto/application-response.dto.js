"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationResponseDto = void 0;
class ApplicationResponseDto {
    id;
    postId;
    applicantId;
    status;
    coverLetter;
    resumeUrl;
    resumeFileName;
    recruiterNote;
    contactPhone;
    contactEmail;
    createdAt;
    updatedAt;
    post;
    applicant;
    constructor(application) {
        this.id = application.id;
        this.postId = application.postId;
        this.applicantId = application.applicantId;
        this.status = application.status;
        this.coverLetter = application.coverLetter;
        this.resumeUrl = application.resumeUrl;
        this.resumeFileName = application.resumeFileName;
        this.recruiterNote = application.recruiterNote;
        this.contactPhone = application.contactPhone;
        this.contactEmail = application.contactEmail;
        this.createdAt = application.createdAt;
        this.updatedAt = application.updatedAt;
        if (application.post) {
            this.post = {
                id: application.post.id,
                title: application.post.title,
                organizationName: application.post.organizationName,
                isRecruiting: application.post.isRecruiting,
            };
        }
        if (application.applicant) {
            this.applicant = {
                id: application.applicant.id,
                nickname: application.applicant.nickname,
                email: application.applicant.email,
                profileImage: application.applicant.profileImage,
                jobType: application.applicant.jobType,
                career: application.applicant.career,
            };
        }
    }
}
exports.ApplicationResponseDto = ApplicationResponseDto;
//# sourceMappingURL=application-response.dto.js.map