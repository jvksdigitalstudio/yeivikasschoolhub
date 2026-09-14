import { trackEvent } from './index';
import type { AnalyticsEvent } from '../../types';

/**
 * Delegación de eventos: cualquier elemento con `data-analytics-event`
 * dispara `trackEvent` al hacer click, sin necesidad de JS individual
 * por componente. Se registra una sola vez desde BaseLayout.
 */
function bindAnalyticsClickDelegation() {
  document.addEventListener('click', (evt) => {
    const target = (evt.target as HTMLElement)?.closest<HTMLElement>('[data-analytics-event]');
    if (!target) return;

    // Cast necesario y documentado (no evitable con un mapa tipado, a
    // diferencia del que existía en SocialLinks): `dataset` es
    // `DOMStringMap`, propiedades `string | undefined` por definición
    // del DOM. El valor de origen ya está garantizado por
    // `analyticsAttrs()`, que solo acepta `AnalyticsEvent`.
    const event = target.dataset.analyticsEvent as AnalyticsEvent | undefined;
    if (!event) return;

    let payload = {};
    if (target.dataset.analyticsPayload) {
      try {
        payload = JSON.parse(target.dataset.analyticsPayload);
      } catch {
        payload = {};
      }
    }

    trackEvent(event, payload);
  });
}

/**
 * Registra `page_view` una vez por carga de documento.
 *
 * Este sitio es multipágina (sin View Transitions/router de cliente),
 * así que una carga de documento equivale exactamente a una vista de
 * página: no hace falta escuchar navegación de cliente. Se ejecuta
 * después de que el script se cargue (al final de <body>), por lo
 * que no bloquea el render, y no depende de ningún proveedor: solo
 * llama a `trackEvent`, igual que cualquier otro evento.
 */
function trackInitialPageView() {
  trackEvent('page_view', { path: window.location.pathname });
}

bindAnalyticsClickDelegation();
trackInitialPageView();
