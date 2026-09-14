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
