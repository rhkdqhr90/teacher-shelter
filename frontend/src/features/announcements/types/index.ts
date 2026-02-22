export interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementsResponse {
  data: Announcement[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
