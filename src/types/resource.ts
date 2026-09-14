import type { CollectionEntry } from 'astro:content';
import type { resourceTypes, resourceAvailabilities, publicationStatuses } from '../content.config';

/**
 * El contrato canónico de esta entidad vive en el schema Zod de
 * `src/content.config.ts` (colección `recursos`). Estos tipos son
 * proyecciones de ese schema, no una interfaz paralela.
 */
export type ResourceType = (typeof resourceTypes)[number];
export type ResourceAvailability = (typeof resourceAvailabilities)[number];
export type ResourceStatus = (typeof publicationStatuses)[number];

/** Entrada de la colección `recursos` tal como la entrega el Content Layer. */
export type Resource = CollectionEntry<'recursos'>;
