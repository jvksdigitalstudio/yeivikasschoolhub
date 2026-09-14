export type ResourceType = 'dwp' | 'instrument' | 'preset' | 'sample' | 'tool' | 'other';

export type ResourceAvailability = 'free' | 'premium' | 'external' | 'coming-soon';

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  image?: string;
  url: string;
  type: ResourceType;
  availability: ResourceAvailability;
  featured: boolean;
  external: boolean;
}
