export interface SiteConfig {
  name: string;
  brand: string;
  handle: string;
  description: string;
  language: string;
  locale: string;
  /** Dominio de producción. `undefined` mientras no exista uno real. */
  url?: string;
  logo?: string;
  /**
   * Ruta (relativa a `public/`) de la imagen de social preview
   * (`og:image` / `twitter:image`), p. ej. `/social/og-cover.png`.
   * `undefined` mientras no exista un asset oficial aprobado: no
   * inventar uno. BaseLayout ya está preparado para consumirla en
   * cuanto se defina aquí, sin tocar ninguna página.
   */
  socialImage?: string;
}
