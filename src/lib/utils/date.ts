/**
 * Formatea una fecha ISO a un formato legible en español.
 * Devuelve `null` si no hay fecha (para poder ocultar el dato en UI).
 */
export function formatPublishedDate(isoDate?: string): string | null {
  if (!isoDate) return null;

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
