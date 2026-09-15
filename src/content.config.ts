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

/**
 * Valida una referencia de imagen editorial: o bien una URL externa
 * real (http/https — p. ej. el thumbnail que ya sirve la propia
 * plataforma del contenido), o bien una ruta local absoluta desde la
 * raíz pública bajo la convención acordada (`/images/content/...` o
 * `/images/resources/...`). Rechaza explícitamente rutas relativas
 * (`../images/...`, `./images/...`, `src/...`), que no tienen una
 * base fiable entre dev/build y romperían en producción.
 */
function isValidAssetReference(value: string, localPrefix: string): boolean {
  return /^https?:\/\//.test(value) || value.startsWith(localPrefix);
}

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
    thumbnail: z
      .string()
      .optional()
      .refine((value: string | undefined) => value === undefined || isValidAssetReference(value, '/images/content/'), {
        message:
          'thumbnail debe ser una URL absoluta (http/https) o una ruta local que empiece por "/images/content/", no una ruta relativa.',
      }),
    publishedAt: z.coerce.date(),
    featured: z.boolean(),
    status: z.enum(publicationStatuses),
  }),
});

export const resourceTypes = ['dwp', 'instrument', 'preset', 'sample', 'tool', 'other'] as const;

export const resourceAvailabilities = ['free', 'premium', 'external', 'coming-soon'] as const;

const recursos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recursos' }),
  schema: z
    .object({
      title: z.string().min(1),
      description: z.string().min(1),
      category: z.string().min(1),
      type: z.enum(resourceTypes),
      url: z.string().url().optional(),
      image: z
        .string()
        .optional()
        .refine(
          (value: string | undefined) => value === undefined || isValidAssetReference(value, '/images/resources/'),
          {
            message:
              'image debe ser una URL absoluta (http/https) o una ruta local que empiece por "/images/resources/", no una ruta relativa.',
          }
        ),
      availability: z.enum(resourceAvailabilities),
      /**
       * Orden editorial explícito (menor = aparece antes). Obligatorio:
       * la colección está vacía hoy (fase de cierre de contrato, antes
       * de introducir contenido real), así que no hay coste de
       * migración por exigirlo desde ya. Hacerlo obligatorio evita
       * además tener que inventar una regla de desempate en tiempo de
       * ejecución para recursos sin valor — la garantía vive en el
       * schema, no en `lib/resources/queries.ts`.
       */
      sortOrder: z.number().int().nonnegative(),
      featured: z.boolean(),
      status: z.enum(publicationStatuses),
    })
    .refine(
      (resource: { availability: (typeof resourceAvailabilities)[number]; url?: string }) =>
        resource.availability === 'coming-soon' || Boolean(resource.url),
      {
        message:
          'url es obligatoria y debe ser una URL válida salvo cuando availability es "coming-soon".',
        path: ['url'],
      }
    ),
});

export const collections = { contenido, recursos };
