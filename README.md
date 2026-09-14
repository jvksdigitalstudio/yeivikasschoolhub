# YeiViKas school Digital Hub

Propiedad web oficial de **YeiViKas school** (`@yeivikasschool`): un hub propio que
organiza y contextualiza el ecosistema digital de la marca (contenido, recursos,
comunidad, canales oficiales y contacto). No es un clon de Linktree.

Esta es la **V1**: arquitectura preparada para crecer, pero sin implementar todavía
funcionalidades futuras (productos, cursos, pagos, CMS, autenticación, etc.).

## Stack

- [Astro](https://astro.build) `^4.16.0` (sin framework de UI adicional) — ver
  nota de versión más abajo
- TypeScript (`strict`)
- CSS moderno con Custom Properties (sin librería de utilidades)
- GitHub Actions para CI

### Versión de Astro

Se mantiene **Astro 4.16.x** en esta fase. Se intentó evaluar una
actualización controlada (revisar changelog/breaking changes, instalar,
`astro check`, `astro build`), pero requiere acceso real al registro de npm,
no disponible en el entorno donde se ejecutó esta consolidación (mismo
bloqueo de red que en la instalación, ver sección de Instalación). No se
cambió el número de versión en `package.json` sin poder instalarla y
validarla: hacerlo habría sido una actualización no verificada. Queda
pendiente para un entorno con red.

## Instalación

> **Primera vez en este repositorio:** todavía no existe `package-lock.json`.
> Ejecuta `npm install` una sola vez para generarlo y **commitéalo**. A partir
> de ahí, tanto tu máquina como el CI deben usar `npm ci` (instalación
> reproducible a partir del lockfile).

```bash
npm install   # primera vez: genera package-lock.json
git add package-lock.json
git commit -m "chore: add package-lock.json"
```

```bash
npm ci        # en adelante, en cualquier entorno limpio (incluido CI)
```

### Estado real de la instalación (verificado en este entorno de trabajo)

`package-lock.json` **no se generó todavía**. Se intentó realmente:

```bash
$ npm install
npm error code E403
npm error 403 403 Forbidden - GET https://registry.npmjs.org/@astrojs%2fcheck
npm error 403 In most cases, you or one of your dependencies are requesting
npm error 403 a package version that is forbidden by your security policy, or
npm error 403 on a server you do not have access to.
```

Causa: el entorno donde se ejecutó esta fase no tiene salida de red hacia
`registry.npmjs.org` (egress bloqueado, `x-deny-reason: host_not_allowed`).
No es un error del proyecto. Pendiente: ejecutar `npm install` en un
entorno con acceso real a npm, commitear el `package-lock.json` resultante,
y a partir de ahí usar `npm ci`.

## Desarrollo

```bash
npm run dev
```

## Comprobación de tipos

```bash
npm run check
```

## Build de producción

`npm run build` ejecuta `astro check && astro build`, de modo que un build no se
considera correcto si existen errores de TypeScript.

```bash
npm run build
```

## Previsualizar el build

```bash
npm run preview
```

## Estructura del proyecto

```
src/
  components/   → UI con responsabilidad única (layout, navigation, hero,
                  content, resources, community, social, contact)
  layouts/       → BaseLayout.astro (html, head, metadata, OG, canonical)
  pages/         → rutas (/, /contenido, /recursos, /comunidad, /contacto, /404)
                   Actúan solo como composición + selección de datos + props.
  data/          → datos declarativos puros, fuente única de verdad
                   (site, navigation, social, community, contact, content, resources)
                   No contienen lógica de selección/filtrado.
  lib/
    content/queries.ts    → selección sobre data/content.ts (publicado, destacado)
    resources/queries.ts  → selección sobre data/resources.ts (destacados)
    social/queries.ts     → selección sobre data/social.ts (enlaces activos)
    social/analytics.ts   → mapa tipado SocialPlatform → AnalyticsEvent (evita casts)
    analytics/    → trackEvent()/analyticsAttrs() + bindings.client.ts (delegación de
                    clicks y page_view), desacoplados de cualquier proveedor
    utils/        → utilidades puntuales (formato de fechas)
  styles/        → tokens.css (variables de diseño) + globals.css
  types/         → un contrato por dominio (site.ts, navigation.ts, social.ts,
                   content.ts, resource.ts, community.ts, contact.ts, analytics.ts).
                   index.ts es solo un barrel de re-exportación, no define tipos.
```

La regla de separación: `data/` nunca contiene lógica de selección, y `lib/*/queries.ts`
nunca contiene datos hardcodeados — solo filtra lo que ya existe en `data/`. Esto permite
que en el futuro el origen del dato cambie (colección local → CMS → API) sin tocar
ningún componente, porque los componentes solo conocen los contratos de `types/`.

Nota: no existe `lib/contact/`. `ContactInfo.email` es obligatorio y ya está
confirmado, así que una función `hasContactEmail()` sería siempre `true` — una
capa sin responsabilidad real. Los componentes leen `data/contact.ts`
directamente. Si en el futuro el contacto pudiera estar ausente, `email`
debería pasar a opcional en `types/contact.ts` y entonces sí se justificaría
una consulta.

## Rutas V1

- `/`
- `/contenido`
- `/recursos`
- `/comunidad`
- `/contacto`
- `/404`

## Datos reales y datos pendientes de confirmar

Por diseño, este proyecto **no inventa** información. Estado actual, centralizado
en `src/data/`:

**Confirmados y activos:**
- YouTube — `https://youtube.com/@yeivikasschool`
- Instagram — `https://www.instagram.com/yeivikasschool`
- TikTok — `https://www.tiktok.com/@yeivikasschool`
- Facebook — `https://www.facebook.com/share/1HMfMaqLr1/` (ver nota abajo)
- Contacto — `jgrcontact25@gmail.com`
- Comunidad — canal de WhatsApp "YeiViKas school"
  (`https://whatsapp.com/channel/0029VbBpOdZCsU9IDjztKV2Oj`) y grupo
  "Los especiales de la producción"
  (`https://chat.whatsapp.com/C2mOLE26ehIDZ0TbtFU0sm`)

**Nota sobre normalización de URLs:** las URLs de YouTube, Instagram y TikTok
se guardan sin sus parámetros de tracking de compartido (`?si=`, `?stkn=`,
`?_r=&_t=`). Esos parámetros los genera cada plataforma por sesión/acción de
compartir — no forman parte del perfil en sí — y no deben quedar
hardcodeados de forma permanente en el código fuente.

**Pendiente de verificación (dato real, pero no ideal como destino final):**
- `src/data/social.ts` — Facebook: la URL proporcionada es un enlace de tipo
  `/share/...`, no la URL canónica de la página (p. ej.
  `facebook.com/<usuario>`). Se conecta porque es un dato real y confirmado,
  no inventado, pero un enlace `/share/` no es la forma recomendada de
  destino permanente en un sitio público. Sustituir por la URL canónica de
  la página en cuanto se confirme.

**Pendientes (placeholder explícito, `active: false` o URL `#`):**
- `src/data/content.ts` y `src/data/resources.ts` — arrays vacíos hasta que
  existan piezas de contenido y recursos reales.
- `astro.config.mjs` (`productionUrl`) y `src/data/site.ts` (`url`) — dominio
  de producción, todavía no definido.

Mientras estos datos falten, la interfaz muestra estados vacíos en vez de
contenido inventado.

## Analytics

Existe un único mecanismo de tracking, sin excepciones: todos los componentes
usan `analyticsAttrs(event, payload)` (spread sobre el elemento) desde
`src/lib/analytics/index.ts`, que genera los atributos `data-analytics-*`
consumidos por la delegación de clicks registrada en
`src/lib/analytics/bindings.client.ts` (cargado una sola vez desde
`BaseLayout`). Ningún componente llama directamente a un proveedor. La
integración con un proveedor real (Plausible, GA, Matomo...) se conecta en
un único punto (`trackEvent()`) sin tocar componentes.

`page_view` está implementado, no solo declarado en el contrato: el mismo
`bindings.client.ts` dispara `trackEvent('page_view', { path })` una vez por
carga de documento. Al ser un sitio multipágina (sin View Transitions ni
router de cliente), una carga de documento equivale exactamente a una vista
de página, así que no hace falta lógica adicional de navegación. El evento
`${platform}_click` de redes sociales usa un mapa tipado
(`src/lib/social/analytics.ts`, `Record<SocialPlatform, AnalyticsEvent>`) en
vez de un cast: si se añade una plataforma nueva sin su evento
correspondiente, la comprobación de tipos falla en ese archivo.

## Sitemap

`astro.config.mjs` deja preparada la integración oficial `@astrojs/sitemap`,
pero **no la instala ni la activa todavía**: la integración necesita `site`
(el dominio real) para generar URLs absolutas, y ese dominio no existe aún.
Activarla cuando llegue el dominio real:

```bash
npm install @astrojs/sitemap
```

y en `astro.config.mjs`: sustituir `productionUrl` por la URL real, y
descomentar el `import` y la línea de `integrations`. A partir de ahí `site`,
el `canonical` de `BaseLayout`, el sitemap generado y `robots.txt` quedan
coherentes entre sí sin más cambios.

## CI

`.github/workflows/ci.yml` ejecuta: checkout → setup Node → `npm ci` →
`npm run build` en cada push/PR a `main`.

No hay un paso separado de `npm run check`: `build` ya es `astro check &&
astro build`, así que un paso de CI adicional solo para el check ejecutaba
`astro check` dos veces por run sin aportar nada. `npm run check` se
mantiene como script independiente para uso local/editor, pero en CI basta
con `build`, que sigue fallando rápido ante cualquier error de tipos antes
de intentar compilar.
