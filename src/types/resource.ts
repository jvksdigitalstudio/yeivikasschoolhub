import type { CollectionEntry } from 'astro:content';
import type {
  resourceTypes,
  resourceAvailabilities,
  resourceSources,
  publicationStatuses,
} from '../content.config';

/**
 * El contrato canónico de esta entidad vive en el schema Zod de
 * `src/content.config.ts` (colección `recursos`). Estos tipos son
 * proyecciones de ese schema, no una interfaz paralela.
 */
export type ResourceType = (typeof resourceTypes)[number];
/** Eje comercial: ¿cuesta dinero? */
export type ResourceAvailability = (typeof resourceAvailabilities)[number];
/** Eje de procedencia: ¿el enlace es propio del Hub o de un tercero? */
export type ResourceSource = (typeof resourceSources)[number];
export type ResourceStatus = (typeof publicationStatuses)[number];

/** Entrada de la colección `recursos` tal como la entrega el Content Layer. */
export type Resource = CollectionEntry<'recursos'>;
