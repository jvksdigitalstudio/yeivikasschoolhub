import { getCollection } from 'astro:content';
import type { Resource } from '../../types/resource';

/**
 * Capa de consulta entre el Content Layer de Astro y la UI.
 * Ver nota de responsabilidad en `lib/content/queries.ts`.
 */

export async function getPublishedResources(): Promise<Resource[]> {
  return getCollection('recursos', ({ data }) => data.status === 'published');
}

export async function getFeaturedResources(): Promise<Resource[]> {
  const published = await getPublishedResources();
  return published.filter((resource) => resource.data.featured);
}
