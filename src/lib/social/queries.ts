import type { SocialLink } from '../../types/social';
import { socialLinks } from '../../data/social';

/**
 * Capa de consulta/selección sobre `data/social.ts`.
 * Ver nota de responsabilidad en `lib/content/queries.ts`.
 */
export const activeSocialLinks = (): SocialLink[] => socialLinks.filter((link) => link.active);
