import { getCollection } from 'astro:content';
import type { Resource } from '../../types/resource';

/**
 * Capa de consulta entre el Content Layer de Astro y la UI.
 * Ver nota de responsabilidad en `lib/content/queries.ts`.
 */

export async function getPublishedResources(): Promise<Resource[]> {
  const entries = await getCollection('recursos', ({ data }) => data.status === 'published');
  // sortOrder es obligatorio en el schema (ver content.config.ts): no hace
  // falta una regla de desempate para valores ausentes. Empates en el
  // mismo sortOrder mantienen el orden de lectura del loader (Array.sort
  // es estable), lo cual es un comportamiento determinista aceptable.
  return entries.sort((a, b) => a.data.sortOrder - b.data.sortOrder);
}

export async function getFeaturedResources(): Promise<Resource[]> {
  const published = await getPublishedResources();
  return published.filter((resource) => resource.data.featured);
}
