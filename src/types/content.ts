export type ContentStatus = 'published' | 'draft' | 'archived';

export type ContentPlatform = 'youtube' | 'tiktok' | 'instagram' | 'facebook';

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: string;
  platform: ContentPlatform;
  url: string;
  thumbnail?: string;
  publishedAt?: string;
  featured: boolean;
  status: ContentStatus;
}
