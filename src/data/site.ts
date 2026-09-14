import type { SiteConfig } from '../types/site';

/**
 * Fuente única de verdad de la configuración general del sitio.
 *
 * `url` se deja sin definir intencionalmente: todavía no existe un
 * dominio de producción confirmado para YeiViKas school. Cuando exista,
 * debe definirse aquí y en `astro.config.mjs` (campo `site`).
 */
export const site: SiteConfig = {
  name: 'YeiViKas school Digital Hub',
  brand: 'YeiViKas school',
  handle: '@yeivikasschool',
  description:
    'Educación, recursos y comunidad para productores musicales. YeiViKas school: aprende, crea, produce.',
  language: 'es',
  locale: 'es_ES',
  url: undefined,
  logo: undefined,
};
