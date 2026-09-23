export type SocialPlatform = 'youtube' | 'tiktok' | 'instagram' | 'facebook';

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  label: string;
  /** URL real del canal/perfil. Placeholder explícito hasta confirmarse. */
  url: string;
  description: string;
  active: boolean;
}
