import type { ContentItem } from '../../types/content';
import { contentItems } from '../../data/content';

/**
 * Capa de consulta/selección sobre `data/content.ts`.
 *
 * Vive aquí y no en `data/` porque no es dato declarativo: es lógica
 * de negocio (qué se considera "publicado" o "destacado"). Mantenerla
 * separada permite, en el futuro, sustituir el origen del dato
 * (colección local → CMS → API) sin tocar los componentes que
 * consumen estas funciones.
 */

export const publishedContent = (): ContentItem[] =>
  contentItems.filter((item) => item.status === 'published');

export const featuredContent = (): ContentItem[] =>
  publishedContent().filter((item) => item.featured);
