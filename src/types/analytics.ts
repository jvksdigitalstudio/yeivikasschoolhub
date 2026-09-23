export type AnalyticsEvent =
  | 'page_view'
  | 'content_click'
  | 'resource_click'
  | 'youtube_click'
  | 'instagram_click'
  | 'tiktok_click'
  | 'facebook_click'
  | 'whatsapp_channel_click'
  | 'whatsapp_group_click'
  | 'contact_click';

export interface AnalyticsPayload {
  [key: string]: string | number | boolean | undefined;
}
