import type { SocialLink } from '../types/social';

/**
 * Fuente única de verdad de las redes oficiales de YeiViKas school.
 *
 * Este archivo contiene solo datos declarativos. El filtrado de
 * enlaces activos vive en `src/lib/social/queries.ts`.
 *
 * Las URLs se guardan en su forma canónica, sin parámetros de
 * tracking de compartido (`?si=`, `?stkn=`, `?_r=&_t=`): esos
 * parámetros los añade cada plataforma por sesión/acción de compartir,
 * no identifican el perfil en sí, y no deben quedar hardcodeados de
 * forma permanente en el código fuente.
 *
 * Facebook: se conecta la URL real proporcionada, pero es un enlace
 * de tipo `/share/...`, no la URL canónica de la página (p. ej.
 * `facebook.com/<usuario>`). Un enlace `/share/` puede funcionar,
 * pero no es la forma recomendada para un destino permanente en el
 * Hub. Queda activo porque es un dato real confirmado, no inventado,
 * pero **pendiente de verificación**: sustituir por la URL canónica
 * de la página en cuanto se confirme.
 *
 * Header, Footer, Home y Comunidad leen todos de este único archivo.
 */
export const socialLinks: SocialLink[] = [
  {
    id: 'youtube',
    platform: 'youtube',
    label: 'YouTube',
    url: 'https://youtube.com/@yeivikasschool',
    description: 'Contenido profundo, educación y autoridad.',
    active: true,
  },
  {
    id: 'tiktok',
    platform: 'tiktok',
    label: 'TikTok',
    url: 'https://www.tiktok.com/@yeivikasschool',
    description: 'Descubrimiento y alcance.',
    active: true,
  },
  {
    id: 'instagram',
    platform: 'instagram',
    label: 'Instagram',
    url: 'https://www.instagram.com/yeivikasschool',
    description: 'Presencia de marca y relación.',
    active: true,
  },
  {
    id: 'facebook',
    platform: 'facebook',
    label: 'Facebook',
    // Enlace real proporcionado, tipo /share/. Ver nota de cabecera:
    // pendiente de verificación como destino canónico y estable.
    url: 'https://www.facebook.com/share/1HMfMaqLr1/',
    description: 'Distribución y audiencia adicional.',
    active: true,
  },
];
