import type { CollectionEntry } from 'astro:content';
import type { contentPlatforms, publicationStatuses } from '../content.config';

/**
 * El contrato canónico de esta entidad vive en el schema Zod de
 * `src/content.config.ts` (colección `contenido`). Estos tipos son
 * proyecciones de ese schema, no una interfaz paralela: evita tener
 * dos fuentes de verdad que puedan divergir.
 */
export type ContentStatus = (typeof publicationStatuses)[number];
export type ContentPlatform = (typeof contentPlatforms)[number];

/** Entrada de la colección `contenido` tal como la entrega el Content Layer. */
export type ContentItem = CollectionEntry<'contenido'>;
