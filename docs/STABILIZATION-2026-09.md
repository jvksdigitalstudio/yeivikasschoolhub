# Fase de estabilización técnica — septiembre 2026

Registro técnico de los cambios reales aplicados sobre el código antes de
introducir el inventario editorial de contenido. No sustituye al README;
documenta decisiones de diseño que no son obvias solo leyendo el diff.

## 1. Modelo `Resource`: separación de `availability` y `source`

**Antes:** `availability: 'free' | 'premium' | 'external' | 'coming-soon'`.

**Problema real:** `'external'` no es un estado comercial, es una
procedencia. El enum colapsaba dos preguntas de dominio distintas
("¿cuesta dinero?" y "¿dónde vive el enlace?") en un solo campo, lo que
hacía imposible representar un recurso real como *premium alojado en una
tienda externa* o *gratis alojado en un Drive externo*: el schema solo
permitía escoger una etiqueta, nunca la combinación.

**Cambio aplicado** (`src/content.config.ts`, `src/types/resource.ts`,
`src/types/index.ts`, `src/components/resources/ResourceCard.astro`):

- `resourceAvailabilities`: `'free' | 'premium' | 'coming-soon'` (eje
  comercial).
- `resourceSources`: `'internal' | 'external'` (eje de procedencia),
  campo nuevo y obligatorio `source` en el schema.
- `ResourceCard.astro` muestra el badge de `availability` como antes, y
  añade un segundo badge (`Enlace externo`) solo cuando
  `source === 'external'`; para `internal` no se anuncia nada (caso
  implícito). No se pierde información respecto al comportamiento
  anterior.

**Coste de migración:** cero. La colección `recursos` está vacía en esta
fase (antes del inventario editorial), confirmado en el propio schema.

## 2. Endurecimiento de URLs editoriales

**Antes:** `url: z.string().url()`, que acepta cualquier protocolo válido
para el estándar WHATWG URL (`javascript:`, `data:`, `mailto:`, `ftp:`,
etc.), no solo `http`/`https`.

**Cambio aplicado** (`src/content.config.ts`): nuevo validador compartido
`editorialUrl` = `z.string().url().refine(...)`, que exige
`protocol === 'http:' || protocol === 'https:'`. Se aplica a
`contenido.url` (obligatorio) y `recursos.url` (opcional). La validación
vive en el schema, no en componentes, tal como exige la arquitectura.

**No afectado:** `thumbnail` e `image` siguen usando
`isValidAssetReference`, que ya permitía tanto `http(s)://` como rutas
locales bajo `/images/...`. No se tocó esa función ni su contrato.

## 3. Tokens visuales

Colores hardcoded detectados fuera de `tokens.css`, extraídos a tokens
semánticos:

| Valor | Ubicación original | Token nuevo | Uso |
|---|---|---|---|
| `#7bd88f` | `ResourceCard.astro` | `--color-success` | Badge de recurso gratuito |
| `#17130a` | `globals.css` (`.btn-primary`) | `--color-on-brand` | Texto sobre el gradiente dorado de marca |

Sin cambio visual: mismos valores hexadecimales, ahora centralizados en
`src/styles/tokens.css`.

## 4. `MobileMenu.astro` — gestión de foco

Se mantiene el patrón existente (sin librerías externas) y se añaden dos
mejoras concretas:

1. **Estado accesible explícito del botón:** el texto oculto visualmente
   del botón cambia entre "Abrir menú de navegación" y "Cerrar menú de
   navegación" según el estado, además de `aria-expanded`.
2. **Cierre por pérdida de foco (`focusout`):** si el foco sale del panel
   y del botón hacia cualquier otro punto de la página (p. ej. `Tab`
   hacia adelante desde el último enlace), el panel se cierra
   automáticamente.

**Decisión: no se implementa un focus trap.** Este componente es un
patrón *disclosure* (menú desplegable inline — WAI-ARIA APG "Disclosure
Navigation Menu"), no un diálogo modal: no cubre la pantalla con un
scrim ni bloquea el resto de la página. Ciclar el `Tab` dentro del panel
indefinidamente introduciría una trampa de teclado (WCAG 2.1.2) en un
widget que no lo requiere. La gestión correcta para este patrón es la
contraria a un trap: cerrar el panel cuando el foco lo abandona, que es
lo implementado.

## 5. Puntos auditados sin cambios (y por qué)

| Área | Estado encontrado | Decisión |
|---|---|---|
| Facebook (`src/data/social.ts`) | URL real tipo `/share/...`, ya documentada como pendiente de sustituir por la canónica | Sin cambios: no se inventa una URL canónica sin confirmación del propietario |
| Build/CI (`package.json`, `ci.yml`, `astro.config.mjs`) | Node `>=22.19.0`, `npm ci` reproducible, `build` ejecuta `astro check && astro build`, CI en Node 22 | Sin cambios: ya cumple todos los criterios |
| SEO (`BaseLayout.astro`) | `canonical`/`og:url` condicionados a `site.url`, `og:image`/`twitter:image` condicionados a `site.url` + `site.socialImage`, 404 con `noindex` | Sin cambios: ya cumple todos los criterios |
| Analytics (`src/lib/analytics/*`) | Abstracción `trackEvent()` desacoplada, sin proveedor conectado | Sin cambios: ya cumple el objetivo de esta fase |

## 6. Validación ejecutada y su resultado real

El entorno de esta sesión **no tiene acceso de red** (`npm error 403` al
intentar `npm ci` contra `registry.npmjs.org`), por lo que **no fue
posible instalar dependencias ni ejecutar `astro check` / `astro build`
reales** en este entorno. Esto no se declara como éxito.

Como verificación parcial sustitutiva, se ejecutó un chequeo de tipos
aislado con `tsc --strict` (TypeScript instalado globalmente en el
entorno, con *stubs* mínimos para `astro:content` y `astro/loaders`)
sobre:

- `src/content.config.ts`
- `src/types/*.ts`
- El script cliente de `MobileMenu.astro` (extraído a un `.ts` temporal,
  con `lib: ["DOM"]`)

Resultado: **0 errores** en ambos casos.

**Esto no equivale a `astro check`/`astro build` reales**: no valida la
sintaxis de plantillas `.astro`, el tipado de `Props`, ni la integración
real con el compilador de Astro. Queda pendiente que el usuario ejecute,
en un entorno con acceso a npm:

```bash
npm ci
npm run check
npm run build
```

y confirme el resultado.

---

# Pass 2 — auditoría técnica completa posterior a la estabilización

Segunda auditoría (`YEIVIKAS_PHASE_STABILIZATION_PASS2_PROMPT_CLAUDE.md`),
ejecutada sobre el resultado real de la fase anterior, no sobre una
reconstrucción hipotética. Cambios realmente implementados a partir de
hallazgos confirmados en el código:

## 1. Modelo `Resource` — `url` según `source` (hallazgo crítico)

**Problema real confirmado:** `editorialUrl` (http/https estricto) se
aplicaba también a `recursos.url`, pero `source: 'internal'` está
documentado como "servido/alojado por el propio Hub" — un concepto que
incluye archivos propios distribuidos como descarga (p. ej. un preset o
sample), no solo URLs absolutas. El contrato bloqueaba ese caso real
(Caso A del dominio) sin ninguna alternativa.

**Decisión tomada:** `source` determina qué formas de `url` son válidas,
no solo `availability`:

```text
source = external → url debe ser http:// o https:// (Caso C, siempre plataforma de terceros)
source = internal → url puede ser http://, https:// (Caso B) o una ruta
                     local absoluta bajo /downloads/... (Caso A, nueva
                     convención, mismo patrón que /images/content/ e
                     /images/resources/)
```

Implementado en `src/content.config.ts`: `url` pasa a `z.string().min(1).optional()`
y toda la validación de forma se centraliza en un único `.superRefine()`
con la función `isValidResourceUrl(value, source)`. Se creó
`public/downloads/.gitkeep` para reservar la convención, igual que ya
existía para las carpetas de imágenes. No se inventó ningún archivo ni
URL real: solo se reservó la ruta.

Las seis combinaciones exigidas por el prompt
(`free|premium|coming-soon` × `internal|external`) se verificaron con un
script standalone (`tsx`) que ejercita `isValidResourceUrl` extraída tal
cual del código real: **27/27 verificaciones correctas**, incluyendo los
casos inválidos (`javascript:`, `data:`, `ftp:`, ruta relativa, ruta
externa con prefijo local, URL malformada `https://` a secas).

## 2. `isValidAssetReference` — hardening real (hallazgo medio)

**Problema real confirmado:** la rama http/https usaba
`/^https?:\/\//.test(value)`, un chequeo de solo-prefijo: un valor como
`"https://"` a secas, o con espacios o caracteres inválidos después del
prefijo, superaba la validación por empezar con el texto correcto sin
ser una URL real.

**Cambio implementado:** se reutiliza `hasAllowedEditorialProtocol`
(parseo real vía `new URL()`, ya existente para `editorialUrl`) en vez
de duplicar lógica de validación. Las rutas locales bajo
`/images/content/`/`/images/resources/` no se tocan. Verificado con el
mismo script standalone: `"https://"` a secas ahora se rechaza
correctamente; las rutas locales y URLs reales siguen aceptándose.

## 3. MobileMenu — bug real de `focusout` (hallazgo alto)

**Problema real confirmado, reproducido paso a paso:** el listener de
`focusout` estaba asociado solo al `panel`. Secuencia real que fallaba:

```text
abrir menú → Tab al primer enlace → Shift+Tab (foco vuelve al botón,
correcto) → Shift+Tab otra vez (el foco sale del BOTÓN hacia el
elemento previo de la página)
```

En ese último paso, el foco nunca vuelve a entrar en `panel`: sale
directamente desde `toggle`, que no tenía ningún listener de
`focusout` propio. Resultado: el menú quedaba visualmente abierto
(`aria-expanded="true"`, panel visible) con el foco ya fuera del
componente completo.

**Corrección implementada:** el listener de `focusout` se mueve del
`panel` al contenedor completo (`#mobile-menu-root`, que envuelve botón
+ panel). Con un único punto de escucha en el contenedor se cubren
ambas direcciones (salida por el primer/último enlace y salida por el
propio botón) sin necesidad de un focus trap — se mantiene la decisión
ya documentada de que este es un patrón *disclosure*, no un diálogo
modal (WAI-ARIA APG). También se aprovechó para simplificar el
listener de "click fuera", que antes comprobaba `panel` y `toggle` por
separado y ahora solo comprueba `root`.

Verificado con chequeo de tipos aislado (`tsc --strict` + `lib: DOM`):
0 errores. La secuencia completa de teclado se revisó manualmente
línea por línea contra el código real; no se pudo ejecutar en un
navegador real dentro de este entorno (sin Playwright con navegadores
instalados ni servidor de dev disponible sin `npm ci`).

## 4. Analytics — `JSON.parse()` sin control de forma (hallazgo medio)

**Problema real confirmado:** `JSON.parse(target.dataset.analyticsPayload)`
devuelve `any` (tipo de retorno nativo de `JSON.parse`), y se asignaba
directamente a `payload` sin ninguna verificación de forma. Un array,
un string suelto, `null`, o un objeto con propiedades `object`/función
habrían pasado sin que TypeScript lo marcara, pese a que `AnalyticsPayload`
solo admite `string | number | boolean | undefined` por propiedad.

**Cambio implementado:** nueva función `toAnalyticsPayload(value: unknown)`
en `src/lib/analytics/index.ts`, único punto donde ese valor no
confiable de runtime se fuerza a la forma real de `AnalyticsPayload`
(objeto plano, propiedades filtradas por tipo permitido). No se
introdujo ninguna dependencia. Verificado con el script standalone:
array, `null`, string suelta y objetos anidados/funciones se descartan
correctamente; un objeto plano válido pasa intacto.

## 5. README desactualizado (hallazgo documental)

**Problema real confirmado:** el README seguía describiendo
`free`/`premium`/`external` como si `availability` tuviera cuatro
valores, contradiciendo el schema real ya corregido en la fase
anterior.

**Cambio implementado:** la sección de reglas de validación de
`recursos` en `README.md` se reescribió para describir exactamente el
contrato real: `availability`/`source` como ejes independientes, la
regla de `url` obligatoria salvo `coming-soon`, y la regla de forma de
`url` según `source` (incluida la nueva convención `/downloads/`).

## 6. Puntos auditados sin cambios (con evidencia revisada)

| Área | Evidencia revisada | Decisión |
|---|---|---|
| Arquitectura modular / Content Layer | `grep` confirmó que ningún componente/página llama a `getCollection()` fuera de `lib/*/queries.ts`; ambas colecciones usan `loader: glob()`, ninguna usa la API legacy `type: 'content'` | Sin cambios |
| TypeScript | Sin `any` explícito nuevo; `ResourceSource` exportado correctamente desde `types/resource.ts` y `types/index.ts`; uniones derivadas de los arrays de `content.config.ts`, no duplicadas | Sin cambios |
| `socialClickEvent` (`SocialPlatform → AnalyticsEvent`) | Ya es un `Record` exhaustivo (falla en `tsc` si se añade una plataforma sin su evento) | Sin cambios |
| SEO / canonical en 404 | `site.url` sigue indefinido a propósito; el posible canonical redundante en una página `noindex` no se manifiesta hoy porque `site.url` no existe todavía | Documentado como observación informativa (ver Riesgos), sin cambio de código: cambiarlo ahora sería especular sobre un comportamiento que no ocurre con el estado real del proyecto |
| CI / dependencias / lockfile | `package.json`, `package-lock.json`, `.github/workflows/ci.yml` sin cambios; `engines.node >=22.19.0` y CI en Node 22 siguen coherentes | Sin cambios |
| CSS / tokens | `grep` de colores hex fuera de `tokens.css`: sin resultados: no se reintrodujo ningún color de marca hardcodeado | Sin cambios |
| HTML / accesibilidad | Un `h1` por página confirmado (`Hero.astro` en home, `PageHeader.astro` en el resto); landmarks `header`/`nav`/`main`/`footer` presentes; enlaces externos con `rel="noopener noreferrer"` en `ContentCard`, `ResourceCard`, `SocialLinks`, `CommunityCard`; imágenes con `alt` | Sin cambios |
| Datos reales (redes, WhatsApp, email, Facebook) | Sin tocar | Sin cambios, tal como exige el prompt |

## Validación ejecutada en esta pasada

- `npm ci`: **FALLÓ** — `403 Forbidden` contra `registry.npmjs.org`
  (mismo error de red que en la fase anterior; entorno sin acceso a
  internet).
- `npm run check` / `npm run build`: **NO EJECUTADO** (dependen de
  `npm ci`).
- Chequeo aislado `tsc --strict` (stubs mínimos de `astro:content` /
  `astro/loaders`) sobre `content.config.ts`, `types/*`, `lib/*`
  (incluye el `bindings.client.ts` y `index.ts` de analytics
  modificados): **0 errores**.
- Chequeo aislado `tsc --strict` con `lib: DOM` del script corregido de
  `MobileMenu.astro`: **0 errores**.
- Script standalone (`tsx`) ejercitando `isValidResourceUrl`,
  `isValidAssetReference` y `toAnalyticsPayload` extraídas tal cual del
  código real, con la matriz completa de casos válidos/inválidos de la
  sección 19 del prompt de auditoría: **27/27 verificaciones
  correctas**.

Ninguno de estos chequeos aislados sustituye a `astro check`/
`astro build` reales: no validan plantillas `.astro`, tipado de
`Props`, ni la integración real con el compilador de Astro. Sigue
pendiente que el usuario ejecute, con acceso a npm:

```bash
npm ci
npm run check
npm run build
```

---

# Pass 3 — revisión general libre (sin prompt de auditoría específico)

Revisión completa del proyecto archivo por archivo, a petición explícita
de "revisar todo y corregir solo si se encuentra algo real". Dos
hallazgos confirmados y corregidos:

## 1. `aria-label` duplicado entre dos `<nav>` en la home (hallazgo real)

`SocialLinks.astro` usa `label = 'Redes oficiales'` por defecto. Se usa
en dos sitios: la sección "Redes" de la home (`<SocialLinks />`, label
por defecto) y el `Footer` (`<SocialLinks variant="compact" />`,
también sin `label` propio → mismo default). Resultado real en `/`: dos
landmarks `<nav>` con el mismo nombre accesible, lo que dificulta
diferenciarlos al navegar por landmarks con lector de pantalla.

**Corrección:** `Footer.astro` ahora pasa
`label="Redes sociales (pie de página)"` a su instancia de
`SocialLinks`, dejando cada `<nav>` del sitio con un nombre accesible
único (`Navegación principal`, `Navegación móvil`, `Navegación
secundaria`, `Redes oficiales`, `Redes sociales (pie de página)`).

## 2. Salto de nivel de encabezado h1 → h3 en tres páginas (hallazgo real)

`ContentCard`, `ResourceCard` y `CommunityCard` usan `<h3>` para el
título de cada tarjeta — correcto en la home, donde cada grid vive bajo
una sección con su propio `<h2>` (`Contenido destacado`, `Recursos para
producir`, `Dos espacios, dos propósitos`). Pero en las páginas
standalone `/contenido`, `/recursos` y `/comunidad`, el grid de tarjetas
se renderiza directamente bajo el `<h1>` de `PageHeader`, sin ningún
`<h2>` intermedio: la jerarquía real saltaba de h1 a h3, lo cual es
incorrecto (WCAG 1.3.1 / mejores prácticas de estructura de encabezados)
y desorienta a quien navega por niveles de encabezado con lector de
pantalla.

**Corrección:** se añadió un `<h2 class="visually-hidden">` (clase
utilitaria ya existente en `globals.css`) en cada una de las tres
páginas, con `aria-labelledby` en la `<section>` que lo envuelve,
siguiendo el mismo patrón ya usado en `FeaturedContent.astro` y
`CommunitySection.astro`. No hay cambio visual: el título sigue oculto
de la vista, solo pasa a existir en el árbol de accesibilidad y en el
esquema de encabezados del documento.

## Sin más hallazgos

Se revisaron también (sin encontrar problemas): `types/*.ts`,
`lib/**/queries.ts` y `lib/social/analytics.ts` (Record exhaustivo
intacto), `data/*.ts` (datos reales, sin cambios), `tokens.css` /
`globals.css` (sin colores hardcodeados nuevos; `--color-danger` sigue
sin usar, se mantiene como token de estado reservado, no es un bug),
`astro.config.mjs`, `package.json`, `.github/workflows/ci.yml`,
`404.astro`, `robots.txt`, `site.webmanifest`, `public/favicon/`.

## Validación de esta pasada

- Chequeo aislado `tsc --strict` sobre todo lo modificable por TS
  (`content.config.ts`, `types/*`, `lib/**`): **0 errores** (esta
  pasada no tocó ningún `.ts`, solo `.astro`; se repitió el chequeo por
  precaución, sin cambios en su resultado).
- Los archivos `.astro` modificados (`Footer.astro`,
  `contenido/index.astro`, `recursos/index.astro`,
  `comunidad/index.astro`) se revisaron manualmente línea por línea
  tras la edición para confirmar balance de etiquetas e indentación; no
  existe forma de tipar/validar plantillas `.astro` sin el compilador
  real de Astro (`npm ci` sigue fallando por red en este entorno).

---

# Pass 4 — auditoría formal completa (checklist de 27 secciones)

Auditoría exhaustiva siguiendo un checklist formal de 27 secciones
(dependencias, Astro, Content Layer, ambas colecciones, assets,
queries, componentes, SEO, accesibilidad, rendimiento, seguridad, Node,
CI, TypeScript, documentación, datos editoriales, validación). **Cero
cambios de código en esta pasada**: no se encontró ningún hallazgo
nuevo que no estuviera ya corregido en los Pass 1–3.

Verificación adicional realizada esta vez, no hecha en pasadas
anteriores: se comprobó **programáticamente** (parseando
`package-lock.json` con Python, no de memoria) que la afirmación del
README sobre por qué `engines.node` exige `>=22.19.0` es exacta:
`undici@8.10.2` (resuelto en el lockfile) sí declara
`engines.node: ">=22.19.0"`, y sí es dependencia transitiva real de
`unifont@0.7.5`, que a su vez es dependencia directa de
`astro@7.3.2`. Versiones resueltas confirmadas en el árbol real:
`astro 7.3.2`, `vite 8.3.0`, `esbuild 0.28.2`, `sharp 0.35.4`,
`typescript 5.9.3` (nota: `package.json` fija `^5.6.3` como mínimo;
`5.9.3` es la resolución real dentro de ese rango, no una
discrepancia).

`npm audit` se intentó explícitamente en esta pasada (no solo `npm
ci`/`npm run build`) y falla por el mismo motivo de red
(`403 Forbidden` / `Host not in allowlist: registry.npmjs.org`):
**ENVIRONMENT FAILURE**, no se pudo determinar el estado real de
vulnerabilidades del árbol de dependencias en este entorno. No se
reporta ninguna vulnerabilidad como activa ni como corregida sin datos
reales que lo respalden.

Se repitió también el chequeo aislado `tsc --strict` sobre todo
`content.config.ts` + `types/*` + `lib/**`: **0 errores** (sin cambios
desde Pass 3, ya que esta pasada no modificó ningún `.ts`).

