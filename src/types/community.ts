export type CommunityType = 'broadcast' | 'group';
export type CommunityAudienceAction = 'follow' | 'join';
export type CommunityPlatform = 'whatsapp';

export interface CommunityDestination {
  id: string;
  name: string;
  type: CommunityType;
  description: string;
  url: string;
  platform: CommunityPlatform;
  audienceAction: CommunityAudienceAction;
  active: boolean;
}
