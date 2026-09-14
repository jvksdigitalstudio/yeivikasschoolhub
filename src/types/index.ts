/**
 * Barrel de re-exportación.
 *
 * Este archivo NO define modelos: cada contrato vive en su propio
 * módulo (site.ts, navigation.ts, social.ts, content.ts, resource.ts,
 * community.ts, contact.ts, analytics.ts). Aquí solo se agregan para
 * que los componentes puedan importar `from '../../types'` sin tener
 * que conocer en qué archivo concreto vive cada tipo.
 */

export type { SiteConfig } from './site';
export type { NavItem } from './navigation';
export type { SocialPlatform, SocialLink } from './social';
export type { ContentStatus, ContentPlatform, ContentItem } from './content';
export type { ResourceType, ResourceAvailability, Resource } from './resource';
export type {
  CommunityType,
  CommunityAudienceAction,
  CommunityPlatform,
  CommunityDestination,
} from './community';
export type { ContactInfo } from './contact';
export type { AnalyticsEvent, AnalyticsPayload } from './analytics';
