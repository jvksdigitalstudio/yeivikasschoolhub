import { getCollection } from 'astro:content';
import type { ContentItem } from '../../types/content';

/**
 * Capa de consulta entre el Content Layer de Astro y la UI.
 *
 * Los componentes/páginas nunca llaman a `getCollection()`
 * directamente: solo conocen estas funciones. Esto permite, en el
 * futuro, sustituir el origen del contenido (Markdown local → CMS/API
 * vía un loader custom) sin tocar componentes ni páginas.
 */

export async function getPublishedContent(): Promise<ContentItem[]> {
  const entries = await getCollection('contenido', ({ data }) => data.status === 'published');
  return entries.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export async function getFeaturedContent(): Promise<ContentItem[]> {
  const published = await getPublishedContent();
  return published.filter((item) => item.data.featured);
}
