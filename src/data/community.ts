import type { CommunityDestination } from '../types/community';

/**
 * Fuente única de verdad de los destinos de comunidad.
 *
 * Nombres y URLs de invitación son reales y están confirmados.
 */
export const communityDestinations: CommunityDestination[] = [
  {
    id: 'whatsapp-channel',
    name: 'YeiViKas school',
    type: 'broadcast',
    description: 'Actualizaciones, anuncios y comunicación oficial.',
    url: 'https://whatsapp.com/channel/0029VbBpOdZCsU9IDjztKV2Oj',
    platform: 'whatsapp',
    audienceAction: 'follow',
    active: true,
  },
  {
    id: 'whatsapp-group',
    name: 'Los especiales de la producción',
    type: 'group',
    description: 'Conversación, participación, intercambio y comunidad.',
    url: 'https://chat.whatsapp.com/C2mOLE26ehIDZ0TbtFU0sm',
    platform: 'whatsapp',
    audienceAction: 'join',
    active: true,
  },
];
