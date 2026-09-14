import { defineConfig } from 'astro/config';

// Dominio de producción de YeiViKas school. Se deja sin definir a
// propósito: todavía no existe un dominio real confirmado y este
// proyecto no inventa dominios ficticios.
//
// Cuando exista el dominio real:
//   1. npm install @astrojs/sitemap
//   2. sustituir `productionUrl` por la URL real (p. ej. 'https://yeivikasschool.com')
//   3. descomentar el `import` y la línea de `integrations` de abajo
// A partir de ahí, `site`, el `canonical` de BaseLayout, el sitemap y
// `robots.txt` quedan coherentes entre sí sin más cambios.
//
// import sitemap from '@astrojs/sitemap';
const productionUrl = undefined;

export default defineConfig({
  site: productionUrl,
  // integrations: productionUrl ? [sitemap()] : [],
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});
