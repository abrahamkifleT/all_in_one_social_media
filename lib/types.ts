export type PlatformId = 'facebook' | 'instagram' | 'youtube' | 'tiktok' | 'linkedin' | 'x';

export type ContentType = 'text' | 'image' | 'video';

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface Platform {
  id: PlatformId;
  name: string;
  color: string;
  gradient: string;
  icon: string;
  supportsText: boolean;
  supportsImage: boolean;
  supportsVideo: boolean;
  maxHashtags?: number;
  charLimit?: number;
}

export interface ApiKeys {
  facebook?: string;
  facebook_page_id?: string;
  instagram?: string;
  instagram_user_id?: string;
  youtube?: string;
  tiktok?: string;
  tiktok_client_key?: string;
  tiktok_client_secret?: string;
  tiktok_refresh_token?: string;
  tiktok_expires_at?: number;
  linkedin?: string;
  linkedin_urn?: string;
  x?: string;
  x_secret?: string;
  x_access_token?: string;
  x_access_secret?: string;
}

export interface PostMetadata {
  title?: string;
  description?: string;
  hashtags: string[];
  mentions: string[];
  location?: string;
  altText?: string;
  category?: string;
  language?: string;
  isSponsored?: boolean;
  scheduledAt?: string; // ISO string
}

export interface MediaFile {
  id: string;
  name: string;
  type: ContentType;
  url: string; // blob URL or data URL
  size: number;
  mimeType: string;
}

export interface Post {
  id: string;
  platforms: PlatformId[];
  contentType: ContentType;
  textContent: string;
  media?: MediaFile;
  metadata: PostMetadata;
  status: PostStatus;
  createdAt: string;
  scheduledAt?: string;
  publishedAt?: string;
  results?: PlatformResult[];
}

export interface PlatformResult {
  platform: PlatformId;
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  posts: Post[];
}
