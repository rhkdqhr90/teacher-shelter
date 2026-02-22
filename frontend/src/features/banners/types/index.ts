export interface Banner {
  id: string;
  imageUrl: string;
  linkUrl?: string | null;
  alt: string;
  isActive?: boolean;
  priority?: number;
}
