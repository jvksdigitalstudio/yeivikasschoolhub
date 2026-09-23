import type { AnalyticsEvent, AnalyticsPayload } from '../../types/analytics';

/**
 * Abstracción de analytics.
 *
 * Ningún componente debe depender directamente de Google Analytics,
 * Plausible, Matomo u otro proveedor. Todos llaman a `trackEvent`.
 * Cuando se decida un proveedor real, la integración se conecta aquí
 * (y solo aquí) sin tocar ningún componente.
 *
 * En V1, si no hay proveedor configurado, el evento simplemente se
 * registra en consola en modo desarrollo para poder verificarlo.
 */
export function trackEvent(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  if (typeof window === 'undefined') return;

  // Punto único de integración futura con un proveedor real, p. ej.:
  // window.plausible?.(event, { props: payload });
  // window.gtag?.('event', event, payload);

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event, payload);
  }
}

/**
 * Helper para adjuntar `trackEvent` a un elemento vía atributos data-*
 * sin necesidad de JavaScript de cliente adicional por componente.
 * Se usa junto con el listener global registrado en BaseLayout.
 */
export function analyticsAttrs(event: AnalyticsEvent, payload: AnalyticsPayload = {}) {
  return {
    'data-analytics-event': event,
    'data-analytics-payload': JSON.stringify(payload),
  };
}

/**
 * Convierte un valor de origen desconocido (típicamente `JSON.parse()`
 * sobre un `data-*` atributo del DOM) en un `AnalyticsPayload` real.
 *
 * `JSON.parse()` devuelve `any`: sin esta función, ese `any` se cuela
 * silenciosamente en `trackEvent()` sin que TypeScript lo marque —
 * un array, un string suelto, `null`, o un objeto con valores
 * `object`/`function` pasarían el chequeo de tipos igual, porque `any`
 * es asignable a cualquier tipo. Esta función es el único punto donde
 * se cruza la frontera "dato no confiable de runtime" → "forma
 * garantizada por el contrato de `AnalyticsPayload`": si el valor no
 * es un objeto plano, o si alguna de sus propiedades no es
 * `string | number | boolean | undefined`, esa propiedad (o el
 * payload entero, si la forma base es inválida) se descarta en vez de
 * dejarla pasar sin control.
 */
export function toAnalyticsPayload(value: unknown): AnalyticsPayload {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }

  const payload: AnalyticsPayload = {};
  for (const [key, entry] of Object.entries(value)) {
    if (
      typeof entry === 'string' ||
      typeof entry === 'number' ||
      typeof entry === 'boolean' ||
      entry === undefined
    ) {
      payload[key] = entry;
    }
  }
  return payload;
}
