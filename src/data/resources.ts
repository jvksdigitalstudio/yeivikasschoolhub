import type { Resource } from '../types/resource';

/**
 * Fuente única de verdad de los recursos (DAW, instrumentos, presets,
 * samples, herramientas...).
 *
 * Este archivo contiene solo datos declarativos. La selección
 * (recursos destacados...) vive en `src/lib/resources/queries.ts`.
 *
 * Queda vacío intencionalmente: el master prompt prohíbe inventar
 * productos, precios o enlaces. Añadir aquí cada `Resource` real
 * cuando exista.
 */
export const resources: Resource[] = [];
