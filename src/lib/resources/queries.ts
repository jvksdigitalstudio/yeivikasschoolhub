import type { Resource } from '../../types/resource';
import { resources } from '../../data/resources';

/**
 * Capa de consulta/selección sobre `data/resources.ts`.
 * Ver nota de responsabilidad en `lib/content/queries.ts`.
 */
export const featuredResources = (): Resource[] => resources.filter((resource) => resource.featured);
