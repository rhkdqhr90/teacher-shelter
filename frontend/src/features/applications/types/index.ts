export enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: '검토 대기',
  [ApplicationStatus.REVIEWING]: '검토 중',
  [ApplicationStatus.ACCEPTED]: '합격',
  [ApplicationStatus.REJECTED]: '불합격',
  [ApplicationStatus.CANCELLED]: '지원 취소',
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  [ApplicationStatus.REVIEWING]: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  [ApplicationStatus.ACCEPTED]: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  [ApplicationStatus.REJECTED]: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  [ApplicationStatus.CANCELLED]: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

export interface Application {
  id: string;
  postId: string;
  applicantId: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  resumeUrl: string | null;
  resumeFileName: string | null;
  recruiterNote: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
  post?: {
    id: string;
    title: string;
    organizationName: string | null;
    isRecruiting: boolean;
  };
  applicant?: {
    id: string;
    nickname: string;
    email: string;
    profileImage: string | null;
    jobType: string | null;
    career: number | null;
  };
}

export interface CreateApplicationInput {
  postId: string;
  coverLetter?: string;
  contactPhone?: string;
  contactEmail?: string;
  resumeUrl?: string;
  resumeFileName?: string;
}

export interface UpdateApplicationStatusInput {
  status: ApplicationStatus;
  recruiterNote?: string;
}
