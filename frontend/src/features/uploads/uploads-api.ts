import { api } from '@/lib/api-client';

interface UploadResponse {
  imageUrl: string;
}

interface FileUploadResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export const uploadsApi = {
  /**
   * 프로필 이미지 업로드
   */
  async uploadProfileImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>('/uploads/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * 프로필 이미지 삭제
   */
  async deleteProfileImage(): Promise<void> {
    await api.delete('/uploads/profile');
  },

  /**
   * 게시글 이미지 업로드
   */
  async uploadPostImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>('/uploads/post', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * 이력서 파일 업로드 (PDF, DOC, DOCX - 10MB 제한)
   */
  async uploadResume(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<FileUploadResponse>(
      '/uploads/resume',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  /**
   * 수업자료 파일 업로드 (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, HWP - 20MB 제한)
   */
  async uploadMaterial(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<FileUploadResponse>(
      '/uploads/material',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },
};
