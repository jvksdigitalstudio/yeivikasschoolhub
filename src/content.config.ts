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
 *
 * La rama http/https reutiliza `hasAllowedEditorialProtocol` (definida
 * más abajo; los `function` se izan, así que el orden de declaración
 * no afecta) en vez de un `RegExp` de solo-prefijo: un valor como
 * `"https://"` a secas, o con espacios/caracteres inválidos, superaba
 * antes `/^https?:\/\//` por empezar con el texto correcto sin ser
 * una URL real. Reutilizar el parseo real de `URL` cierra ese hueco
 * sin duplicar lógica de validación.
 */
function isValidAssetReference(value: string, localPrefix: string): boolean {
  if (value.startsWith(localPrefix)) return true;
  return hasAllowedEditorialProtocol(value);
}

/**
 * URL editorial (destino externo real: video, tienda, sitio de un
 * recurso, etc.). Además de la forma de URL que ya exige `z.string().url()`,
 * se restringe el protocolo a `http`/`https`: son los únicos protocolos
 * válidos para un destino web público del Hub. Esto bloquea en el
 * schema — no en componentes — protocolos que `z.string().url()` acepta
 * por defecto pero que nunca deberían llegar a un `<a href>` editorial
 * (`javascript:`, `data:`, `mailto:`, `ftp:`, etc.), sin afectar en nada
 * a `thumbnail`/`image`, que usan `isValidAssetReference` y no este validador.
 */
const ALLOWED_EDITORIAL_URL_PROTOCOLS = new Set(['http:', 'https:']);

function hasAllowedEditorialProtocol(value: string): boolean {
  try {
    return ALLOWED_EDITORIAL_URL_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}

const editorialUrl = z
  .string()
  .url()
  .refine(hasAllowedEditorialProtocol, {
    message: 'url debe usar protocolo http:// o https:// (destino web público del Hub).',
  });

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
    url: editorialUrl,
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

/**
 * `availability` (estado comercial) y `source` (procedencia del enlace)
 * son dos ejes independientes del dominio, no un único valor:
 *
 * - Antes, `availability` incluía `'external'` como si fuera un estado
 *   comercial más, al mismo nivel que `free`/`premium`/`coming-soon`.
 *   Eso colapsaba dos preguntas distintas ("¿cuesta dinero?" y "¿dónde
 *   vive el archivo/enlace?") en un solo campo, y hacía imposible
 *   modelar un recurso real como "premium, alojado en una tienda
 *   externa" o "gratis, alojado en un Drive externo": el schema solo
 *   permitía elegir una de las cuatro etiquetas, nunca la combinación.
 * - `resourceAvailabilities` queda como el eje puramente comercial:
 *   free | premium | coming-soon.
 * - `resourceSources` es el eje de procedencia: internal (servido/alojado
 *   por el propio Hub) | external (enlace a una plataforma de terceros).
 *
 * La colección `recursos` está vacía en esta fase (antes del inventario
 * editorial real), así que este cambio de schema no tiene coste de
 * migración de contenido existente.
 *
 * El contrato de `url` en función de `availability`/`source` vive en
 * `isValidResourceUrl` y el `.superRefine` de más abajo, no aquí: este
 * comentario documenta solo el porqué de separar los dos ejes.
 */
export const resourceAvailabilities = ['free', 'premium', 'coming-soon'] as const;
export const resourceSources = ['internal', 'external'] as const;

/**
 * Prefijo público reservado para archivos descargables servidos
 * directamente por el propio Hub (recursos `source: 'internal'`
 * distribuidos como archivo, no como enlace a una plataforma), en la
 * misma convención ya usada para `/images/content/` e
 * `/images/resources/`: ruta absoluta bajo `public/`, nunca relativa.
 * No implica que exista ya ningún archivo ahí — solo reserva la
 * convención para cuando el inventario editorial real lo necesite
 * (ver `public/downloads/.gitkeep`).
 */
const INTERNAL_RESOURCE_DOWNLOAD_PREFIX = '/downloads/';

/**
 * Valida `url` de un recurso en función de su `source` (ver nota de
 * diseño arriba sobre por qué son dos ejes independientes):
 *
 * - `external`: el destino es forzosamente una plataforma de
 *   terceros (Caso C del dominio), así que solo se acepta una URL
 *   http/https real.
 * - `internal`: el recurso es propiedad del Hub, pero eso puede
 *   materializarse de dos formas reales distintas, ambas válidas:
 *     (a) una URL http/https propia del ecosistema del Hub una vez
 *         exista dominio (Caso B);
 *     (b) un archivo servido directamente por el propio Hub bajo
 *         `/downloads/...` mientras no haga falta una URL absoluta
 *         (Caso A) — exactamente el mismo patrón que ya existe para
 *         `thumbnail`/`image` con `/images/...`.
 *   Forzar siempre http/https para `internal` bloquearía el Caso A,
 *   que es un escenario real para recursos como presets/samples
 *   distribuidos como archivo propio; por eso no se mantuvo el
 *   contrato anterior tal cual.
 */
function isValidResourceUrl(value: string, source: (typeof resourceSources)[number]): boolean {
  if (hasAllowedEditorialProtocol(value)) return true;
  return source === 'internal' && value.startsWith(INTERNAL_RESOURCE_DOWNLOAD_PREFIX);
}

const recursos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recursos' }),
  schema: z
    .object({
      title: z.string().min(1),
      description: z.string().min(1),
      category: z.string().min(1),
      type: z.enum(resourceTypes),
      url: z.string().min(1).optional(),
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
      source: z.enum(resourceSources),
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
    .superRefine(
      (
        resource: {
          availability: (typeof resourceAvailabilities)[number];
          source: (typeof resourceSources)[number];
          url?: string;
        },
        ctx: { addIssue: (issue: { code: 'custom'; path: string[]; message: string }) => void }
      ) => {
        const urlRequired = resource.availability !== 'coming-soon';

        if (urlRequired && !resource.url) {
          ctx.addIssue({
            code: 'custom',
            path: ['url'],
            message: 'url es obligatoria salvo cuando availability es "coming-soon".',
          });
          return;
        }

        if (resource.url && !isValidResourceUrl(resource.url, resource.source)) {
          ctx.addIssue({
            code: 'custom',
            path: ['url'],
            message:
              resource.source === 'external'
                ? 'url debe ser http:// o https:// cuando source es "external".'
                : 'url debe ser http:// o https://, o una ruta local que empiece por "/downloads/", cuando source es "internal".',
          });
        }
      }
    ),
});

export const collections = { contenido, recursos };
