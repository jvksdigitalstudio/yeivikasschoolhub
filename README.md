# YeiViKas school Digital Hub

Propiedad web oficial de **YeiViKas school** (`@yeivikasschool`): un hub propio que
organiza y contextualiza el ecosistema digital de la marca (contenido, recursos,
comunidad, canales oficiales y contacto). No es un clon de Linktree.

Esta es la **V1**: arquitectura preparada para crecer, pero sin implementar todavía
funcionalidades futuras (productos, cursos, pagos, CMS, autenticación, etc.).

## Stack

- [Astro](https://astro.build) `^7.3.2` (sin framework de UI adicional)
- TypeScript `^5.6.3` (`strict`), validado con `@astrojs/check`
- CSS moderno con Custom Properties (sin librería de utilidades)
- npm + `package-lock.json` (instalación reproducible)
- GitHub Actions para CI

## Requisitos de entorno

- **Node `>=22.19.0`** (`package.json` → `engines.node`). Astro 7 por sí solo
  solo exige `>=22.12.0`, pero `undici@8.10.2` — una dependencia real y
  resuelta en `package-lock.json` (transitiva de `unifont`, usado por Astro
  para fuentes) — declara `>=22.19.0`, que es el requisito más alto de todo
  el árbol instalado. `engines.node` refleja ese máximo real, no solo el de
  Astro, para que la declaración sea honesta con lo que `npm ci` realmente
  instala. `.github/workflows/ci.yml` usa `node-version: '22'`, que
  `actions/setup-node` resuelve al último parche de Node 22 disponible —ya
  por delante de 22.19.0—, así que el workflow no necesitó cambios. Con Node
  20 el build falla antes de arrancar Astro con el error `Node.js vX is not
  supported by Astro!`.
- npm (se usa `npm ci`/`npm install`, no otro gestor de paquetes).

## Instalación

`package-lock.json` **ya existe** y está commiteado. La instalación estándar,
tanto local como en CI, es:

```bash
npm ci
```

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
  content.config.ts → Content Layer: schemas Zod + colecciones `contenido` y
                   `recursos` (API moderna de Astro, loader `glob`). Única
                   fuente de verdad de esas dos entidades editoriales.
  content/
    contenido/   → entradas .md (frontmatter validado por content.config.ts)
    recursos/    → entradas .md (frontmatter validado por content.config.ts)
                   Vacías intencionalmente mientras no exista contenido real.
  data/          → configuración declarativa ESTABLE (no editorial):
                   site, navigation, social, community, contact.
                   No contienen lógica de selección/filtrado.
  lib/
    content/queries.ts    → getPublishedContent()/getFeaturedContent() sobre
                             el Content Layer (colección `contenido`)
    resources/queries.ts  → getPublishedResources()/getFeaturedResources()
                             sobre el Content Layer (colección `recursos`)
    social/queries.ts     → selección sobre data/social.ts (enlaces activos)
    social/analytics.ts   → mapa tipado SocialPlatform → AnalyticsEvent (evita casts)
    analytics/    → trackEvent()/analyticsAttrs() + bindings.client.ts (delegación de
                    clicks y page_view), desacoplados de cualquier proveedor
    utils/        → utilidades puntuales (formato de fechas)
  styles/        → tokens.css (variables de diseño) + globals.css
  types/         → un contrato por dominio (site.ts, navigation.ts, social.ts,
                   content.ts, resource.ts, community.ts, contact.ts, analytics.ts).
                   `content.ts`/`resource.ts` derivan sus tipos de
                   `content.config.ts` (`CollectionEntry<'contenido'|'recursos'>`),
                   no duplican el schema. index.ts es solo un barrel de
                   re-exportación, no define tipos.
```

Regla de separación (dos capas distintas, no confundir):
- **Configuración estable** (`site`, `navigation`, `social`, `community`,
  `contact`) vive en `data/` como datos declarativos puros.
- **Contenido editorial** (`contenido`, `recursos`) vive en el Content Layer
  (`content.config.ts` + `src/content/`), no en `data/`: son entidades que se
  espera que crezcan, tengan estado (`draft`/`published`/`archived`) y
  eventualmente vengan de un CMS/API en vez de Markdown local.

El contenido editorial nunca se lee directamente desde un componente/página:
`getPublishedContent()`/`getFeaturedContent()`/`getPublishedResources()`/
`getFeaturedResources()` son el único punto de acceso a `getCollection()`.
Esto permite que en el futuro el origen del contenido cambie (Markdown local
→ CMS/API vía un loader custom del Content Layer) sin tocar ningún
componente, porque los componentes solo conocen los contratos de `types/`.

`data/` es distinto: no hay una regla absoluta de "siempre pasar por una
query". `site`, `navigation`, `community` y `contact` se leen **directamente**
desde los componentes/páginas que los necesitan (`Header`, `Footer`,
`ContactCTA`, `CommunitySection`, `BaseLayout`...) porque no existe ninguna
lógica de selección, filtrado o transformación que justifique una capa
intermedia — son datos ya listos para usar tal cual. `social.ts` es la
excepción: sí tiene una query (`lib/social/queries.ts` → `activeSocialLinks()`)
porque ahí sí existe una responsabilidad real (filtrar por `active`). La
regla, aplicada con criterio y no de forma literal: una query existe cuando
hay algo real que seleccionar/transformar, no por consistencia superficial —
crear una query que solo reenvíe el array tal cual no aportaría nada.

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

**Pendientes (placeholder explícito, `active: false`, URL `#`, o `undefined`):**
- `src/content/contenido/` y `src/content/recursos/` — colecciones del Content
  Layer vacías hasta que existan piezas de contenido y recursos reales. Añadir
  archivos `.md` con el frontmatter validado por `content.config.ts`.
- `astro.config.mjs` (`productionUrl`) y `src/data/site.ts` (`url`) — dominio
  de producción, todavía no definido.
- `src/data/site.ts` (`socialImage`) — imagen de social preview (`og:image`/
  `twitter:image`), todavía no existe un asset oficial aprobado por la marca.
- `src/data/site.ts` (`logo`) — logotipo oficial, todavía no incorporado.

Mientras estos datos falten, la interfaz muestra estados vacíos en vez de
contenido inventado.

## Contenido y recursos (Content Layer)

`contenido` y `recursos` son colecciones del [Content Layer de
Astro](https://docs.astro.build/en/guides/content-collections/) (API moderna,
loader `glob`, no la legacy `type: 'content'`), definidas en
`src/content.config.ts` con schemas Zod. Los archivos `.md` viven en
`src/content/contenido/` y `src/content/recursos/`.

Reglas de negocio, aplicadas en `lib/content/queries.ts` y
`lib/resources/queries.ts`, no en los componentes:

- `status: "draft"` nunca aparece en listados públicos.
- `status: "archived"` tampoco aparece en listados públicos normales.
- `status: "published"` es lo único que devuelven `getPublishedContent()`/
  `getPublishedResources()`.
- `getFeaturedContent()`/`getFeaturedResources()` devuelven, además,
  solo `featured: true`.

Reglas de validación del schema de `recursos` (fallan en build/dev, no en
runtime):

- `url` es **obligatoria y debe ser una URL válida** salvo cuando
  `availability` es `"coming-soon"` (ahí puede faltar). Un recurso
  `free`/`premium`/`external` sin `url` no pasa la validación del Content
  Layer.
- `sortOrder` (entero, no negativo) es **obligatorio** en todo recurso: la
  colección está vacía hoy, así que exigirlo desde ahora no rompe nada, y
  evita tener que definir una regla de desempate en tiempo de ejecución para
  recursos sin valor. `getPublishedResources()` ordena de forma determinista
  por `sortOrder` ascendente (menor = aparece antes); `getFeaturedResources()`
  hereda ese mismo orden.

`thumbnail` (`contenido`) e `image` (`recursos`) son opcionales — los
componentes ya funcionan correctamente sin ellos — pero, cuando existen,
el schema exige que sean o bien una URL externa real (`http`/`https`, p. ej.
el thumbnail que ya sirve la propia plataforma del contenido), o bien una
ruta local absoluta desde la raíz pública siguiendo la convención
`/images/content/...` / `/images/resources/...` (carpetas
`public/images/content/` y `public/images/resources/`). Rutas relativas
(`../images/...`, `./images/...`, `src/...`) fallan la validación: no tienen
una base fiable entre `astro dev` y `astro build`, así que es mejor
rechazarlas en el schema que dejarlas romperse en producción.

Los valores internos del schema (`platform`, `type`, `availability`...) no se
muestran nunca tal cual en la interfaz: `ContentCard`/`ResourceCard` usan
mapas tipados de etiquetas (`platformLabel`, `typeLabel`, `availabilityLabel`)
para traducir a español lo que se ve en pantalla, sin tocar los valores del
schema. Los mismos valores internos sí se siguen usando, sin traducir, como
payload de analytics (son identificadores estables, no texto de UI).

Ambas colecciones están vacías hoy (0 entradas): el build, las páginas y los
componentes lo soportan sin errores, mostrando el estado vacío correspondiente
en vez de inventar contenido.

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

## SEO

Centralizado en `BaseLayout.astro`, que las páginas alimentan vía props
(`title`, `description`, `path`, `noindex`): title, meta description,
`canonical`, Open Graph y Twitter metadata, `lang`, favicon y manifest. No
se duplica `<head>` en cada página.

`og:image`/`twitter:image` están **preparados arquitectónicamente pero no
activos todavía**: `SiteConfig.socialImage` (en `src/data/site.ts`) es el
único punto a definir cuando exista un asset oficial de social preview
aprobado por la marca — no se ha inventado ninguna imagen. Mientras
`socialImage` (o `site.url`) no estén definidos, `BaseLayout` no emite
`og:image`/`twitter:image`, y `twitter:card` cae a `summary` en vez de
`summary_large_image` para no declarar un formato que promete una imagen
inexistente. En cuanto se añada el asset real a `public/` y se apunte
`socialImage` a su ruta, ambas etiquetas aparecen automáticamente en todas
las páginas sin tocarlas.

`canonical` y `og:url` dependen de `site.url` (dominio de producción) por el
mismo motivo: no se genera una URL absoluta ficticia mientras el dominio no
exista.

## Favicon

El favicon actual (`public/favicon/favicon.svg`, iniciales "YV") es
**técnicamente válido y funcional**, pero es un placeholder provisional, no
la identidad gráfica definitiva de la marca. No se ha inventado un logotipo
nuevo. La identidad oficial se incorporará en una fase posterior cuando
exista el asset aprobado.

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
coherentes entre sí sin más cambios. `robots.txt` no contiene ninguna línea
`Sitemap:` mientras tanto, solo el comentario de dónde añadirla.

## CI

`.github/workflows/ci.yml` ejecuta: checkout → setup Node 22 → `npm ci` →
`npm run build`, en cada push/PR a `main`.

No hay un paso separado de `npm run check`: `build` ya es `astro check &&
astro build`, así que un paso de CI adicional solo para el check ejecutaría
`astro check` dos veces por run sin aportar nada. `npm run check` se
mantiene como script independiente para uso local/editor.

## Estado de validación

`package-lock.json` existe y está commiteado (generado por npm durante la
migración a Astro 7.3.2, no fabricado a mano). El entorno de trabajo donde
se redactó esta versión del README no tiene salida de red hacia
`registry.npmjs.org` (`E403`, `x-deny-reason: host_not_allowed`), así que
`npm ci`/`npm run check`/`npm run build` no pudieron ejecutarse ni
verificarse de nuevo ahí — no se afirma que pasaron si no se ejecutaron. La
validación real de referencia es **GitHub Actions**: el commit `bd13ef5`
("chore: upgrade astro to 7.3.2") migró Astro a 7.3.2 pero inicialmente hizo
fallar el CI porque el workflow todavía usaba Node 20; el commit `6ea941e`
("ci: use Node 22 for Astro 7") corrigió el workflow a Node 22, y es el
run de GitHub Actions posterior a `6ea941e` el que confirmó `npm ci` y
build correctos.

## Estado actual del proyecto

V1 funcional y desplegable en cuanto a arquitectura, datos reales conectados
y CI validado en GitHub Actions. Pendiente antes de producción: dominio
definitivo, asset de social preview oficial, logotipo/identidad gráfica
definitiva, y contenido/recursos reales (hoy vacíos a propósito).

## Principios

- No inventar contenido, estadísticas, testimonios, productos ni dominios.
- Arquitectura modular: `data` declarativo, `lib` con responsabilidad real,
  `types` por dominio, componentes con una sola responsabilidad.
- Separación estricta entre datos, lógica y presentación.
- Evitar dependencias innecesarias: sin frameworks de UI, sin librerías que
  Astro/TypeScript/CSS ya resuelven.
