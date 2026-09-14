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
}
