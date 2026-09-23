import type { AnalyticsEvent } from '../../types/analytics';
import type { SocialPlatform } from '../../types/social';

/**
 * Mapa tipado de `SocialPlatform` → `AnalyticsEvent`.
 *
 * Sustituye a `${platform}_click as AnalyticsEvent`. Al ser un
 * `Record<SocialPlatform, AnalyticsEvent>` literal, si se añade una
 * plataforma nueva a `SocialPlatform` (p. ej. `threads`) sin añadir
 * aquí su evento correspondiente, `astro check`/`tsc` falla en este
 * archivo en vez de dejar pasar un cast silencioso.
 */
export const socialClickEvent: Record<SocialPlatform, AnalyticsEvent> = {
  youtube: 'youtube_click',
  tiktok: 'tiktok_click',
  instagram: 'instagram_click',
  facebook: 'facebook_click',
};
