import type { ContentItem } from '../types/content';

/**
 * Fuente única de verdad del contenido publicado.
 *
 * Este archivo contiene solo datos declarativos. La selección/filtrado
 * (contenido publicado, contenido destacado...) vive en
 * `src/lib/content/queries.ts`, no aquí.
 *
 * Queda vacío intencionalmente: el master prompt prohíbe inventar
 * contenido, categorías o estadísticas. Cuando existan piezas reales
 * de contenido, añadir aquí un `ContentItem` por cada una.
 */
export const contentItems: ContentItem[] = [];
