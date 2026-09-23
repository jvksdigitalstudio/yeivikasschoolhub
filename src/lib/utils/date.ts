/**
 * Formatea una fecha a un formato legible en español.
 *
 * `publishedAt` es un campo obligatorio del schema de `contenido`
 * (ver `src/content.config.ts`), así que aquí siempre llega una
 * `Date` válida: no hace falta manejar el caso "sin fecha".
 */
export function formatPublishedDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
