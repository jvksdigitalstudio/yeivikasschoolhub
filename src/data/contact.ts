import type { ContactInfo } from '../types/contact';

/**
 * Fuente única de verdad del contacto real disponible.
 *
 * `email` es obligatorio y ya está confirmado, así que no existe (ni
 * hace falta) una capa de consulta: los componentes lo leen
 * directamente. Si en el futuro el contacto pudiera estar ausente,
 * `email` debería pasar a ser opcional en `types/contact.ts` y
 * entonces sí se justificaría una función de consulta.
 */
export const contact: ContactInfo = {
  email: 'jgrcontact25@gmail.com',
  responseNote: 'Respondemos lo antes posible.',
};
