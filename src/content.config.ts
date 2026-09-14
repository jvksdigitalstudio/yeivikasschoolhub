import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Configuración del Content Layer (API moderna de Astro 5+/7, no la
 * legacy `type: 'content'`).
 *
 * Este archivo es la ÚNICA fuente de verdad del contrato de
 * `contenido` y `recursos`: los schemas Zod validan en build/dev, y
 * los mismos arrays de valores (`contentPlatforms`, `resourceTypes`...)
 * se reexportan para que `src/types/*.ts` derive sus tipos de aquí en
 * vez de mantener una lista de valores por duplicado.
 *
 * `draft` / `published` / `archived` es el mismo concepto de estado
 * editorial para ambas colecciones, así que se define una sola vez
 * (`publicationStatuses`) y se reutiliza.
 */

export const publicationStatuses = ['draft', 'published', 'archived'] as const;

export const contentPlatforms = [
  'youtube',
  'website',
  'instagram',
  'tiktok',
  'facebook',
  'other',
] as const;

const contenido = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/contenido' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    category: z.string().min(1),
    tags: z.array(z.string()).optional(),
    platform: z.enum(contentPlatforms),
    url: z.string().url(),
    thumbnail: z.string().optional(),
    publishedAt: z.coerce.date(),
    featured: z.boolean(),
    status: z.enum(publicationStatuses),
  }),
});

export const resourceTypes = ['dwp', 'instrument', 'preset', 'sample', 'tool', 'other'] as const;

export const resourceAvailabilities = ['free', 'premium', 'external', 'coming-soon'] as const;

const recursos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recursos' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    category: z.string().min(1),
    type: z.enum(resourceTypes),
    url: z.string().url().optional(),
    image: z.string().optional(),
    availability: z.enum(resourceAvailabilities),
    featured: z.boolean(),
    status: z.enum(publicationStatuses),
  }),
});

export const collections = { contenido, recursos };
