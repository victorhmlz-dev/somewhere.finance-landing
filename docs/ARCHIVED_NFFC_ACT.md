# Acto II/III (NFFC en adelante) — archivado

Estado: **en pausa**, no eliminado. El scrollytelling activo pasó de 13 a 5
capítulos, terminando en "The Universe" (ver `docs/SCROLLYTELLING_BRIEF.md`).
Todo lo que vivía en los capítulos "nffc" → "final" (los últimos 8 de los 13
capítulos activos hasta esta reestructuración) se sacó del flujo activo y se
movió aquí, con sus imports internos ya corregidos para que sigan siendo
código válido de forma aislada — nada se borró.

## Por qué

Restructuración de producto: el recorrido activo ahora se queda en el
"mundo" (singularidad → big bang → nebulosa → chains & empresas tokenizadas
→ universo, cerrando en la marca). El Acto II (NFFC como concepto de
producto: composición, ficha de identidad, ADN digital, actividad de
mercado, universo del usuario) se pausa como iniciativa separada, para
retomarse cuando el producto esté listo para presentarlo.

## Qué se movió y dónde

```
components/archive/act-ii-nffc/
  scenes/
    NffcSystem.jsx        — sistema orbital único (nffc → the-index → non-fungible → digital-dna → market-moves → your-universe)
    GalaxyConnections.jsx — conectores de línea; variant "oneUniverse" (one-universe) + variant "galaxiesChains" ya superseded por el nuevo HubConnections.jsx, no reconectar esa parte
    ChainsField.jsx        — chains como galaxias procedurales completas (superseded por el nuevo EcosystemField.jsx/EcosystemNodes.jsx en el capítulo activo; solo relevante aquí para la reaparición en one-universe). OJO al reconectar: este componente lee `config.position` de cada entrada de data/chains.js — ese campo YA NO EXISTE (se renombró a `offset` y pasó a ser relativo al centro de ECOSYSTEM_SCENE.chains.position, no una posición absoluta en el mundo, para que los iconos sigan a la galaxia si mueves su centro). Reconectar ChainsField.jsx tal cual dará `position: undefined` y romperá — hace falta o bien mapear `offset` a una posición absoluta antes de pasarlo a `<Galaxy>`, o construir un segundo set de posiciones absolutas dedicado a "one-universe".
    RwaNode.jsx             — nodo "real world assets" (descartado como concepto para el capítulo activo — ver docs/SCROLLYTELLING_BRIEF.md; solo relevante para one-universe si se reactiva tal cual)
    CollectionsField.jsx   — galaxias satélite de "colecciones"
    CollectionImage.jsx    — tarjetas de imagen real sobre cada colección (funcionalidad añadida después de la ronda de 13 capítulos; público: public/collections/README.md)
    OrbitalMaterial.js     — shader del sistema orbital de NffcSystem
  dom/
    NffcIdentityCard.jsx + .module.css   — ficha de identidad (non-fungible)
    MarketStats.jsx + .module.css        — panel de actividad de mercado
    OrbitalRingLabels.jsx + .module.css  — etiquetas de anillo (the-index + your-universe)
    ChainLabels.jsx + .module.css        — etiquetas DOM de las chains (superseded por EcosystemNodes.jsx en el capítulo activo)
  CameraRig.13ch.snapshot.jsx    — snapshot de referencia de CameraRig.jsx tal como estaba con 13 capítulos activos
  Experience.13ch.snapshot.jsx  — snapshot de referencia de Experience.jsx con 13 capítulos activos
  page.13ch.snapshot.js          — snapshot de referencia de app/page.js con 13 capítulos activos

lib/archive/act-ii-nffc/
  nffcBridge.js                  — puente mutable cámara→DOM para los anillos del NFFC
  orbitalLayouts.js              — construcción de layouts orbitales (scatter/orbital/hélice)
  chapterRegistry.13ch.snapshot.js — snapshot de referencia del registro de 13 capítulos

data/archive/act-ii-nffc/
  nffc.js            — NFFC mock (composición, historial, featured #0421)
  market.js          — actividad de mercado mock (volumen, ventas, holders, floor, bursts)
  realWorldAssets.js — nodo RWA descartado (ver arriba)
  collections.js      — colecciones-galaxia mock
```

**`FinalCta.jsx` NO se archivó** — se reutiliza tal cual dentro del nuevo
cierre del capítulo activo "The Universe" (ver `docs/SCROLLYTELLING_BRIEF.md`,
capítulo 05): mismo wordmark, tagline y CTA funcional "Explore somewhere",
solo que ahora se revela al final del autoplay de ese capítulo en vez de en
un capítulo propio.

## Referencia: valores que tenían estos capítulos (para reconectar)

Duraciones (`CHAPTER_DURATIONS`, segundos):

| Capítulo (índice activo antes de archivar) | Duración |
|---|---|
| 05 nffc | 3.5 |
| 06 the-index | 4.5 |
| 07 non-fungible | 4.0 |
| 08 digital-dna | 4.5 |
| 09 the-market-moves | 4.0 |
| 10 your-universe | 3.5 |
| 11 one-universe | 4.0 |
| 12 final | 5.0 |

Cámara (`CAMERA`, cada acto continuaba donde terminaba el anterior):

```js
nffc:         { zFrom: 150, zTo: 34,  fovFrom: 80, fovTo: 42, ease: 2.2 },
theIndex:     { zFrom: 34,  zTo: 28,  fovFrom: 42, fovTo: 38, ease: 1.1, orbitMax: 0.22 },
nonFungible:  { zFrom: 28,  zTo: 33,  fovFrom: 38, fovTo: 40, ease: 1.2 },
digitalDna:   { zFrom: 33,  zTo: 30,  fovFrom: 40, fovTo: 56, ease: 1.6, approachDepth: 10, rollMax: 0.03 },
marketMoves:  { zFrom: 30,  zTo: 38,  fovFrom: 56, fovTo: 46, ease: 1.3, approachDepth: 4 },
yourUniverse: { zFrom: 38,  zTo: 34,  fovFrom: 46, fovTo: 42, ease: 1.1 },
oneUniverse:  { zFrom: 34,  zTo: 260, fovFrom: 42, fovTo: 86, ease: 1.5, orbitMax: 0.3 },
final:        { zFrom: 260, zTo: 14,  fovFrom: 86, fovTo: 32, ease: 1.8 },
```

Nota: si se reconecta, `nffc.zFrom` (150) debe ajustarse a lo que sea
`CAMERA.universe.zTo` en ese momento (regla de continuidad entre actos).

Kickers/lettering que existían (`LETTERING.phrases`, ya retirados de
`lib/tuning.js`): "06 — NFFC" / "Not every collectible is just a
collectible." / "Some are built around entire ecosystems of assets.",
"07 — THE INDEX", "08 — NON-FUNGIBLE", "09 — DIGITAL DNA" / "Every
collectible has structure.", "10 — THE MARKET MOVES", "11 — YOUR UNIVERSE" /
"Your assets." / "Your universe.", "12 — ONE UNIVERSE" / "Different chains.
One universe."

Slugs de `chapterRegistry` que existían: `nffc`, `the-index`,
`non-fungible`, `digital-dna`, `the-market-moves`, `your-universe`,
`one-universe`, `final` (el slug `final` se retiró del registro; su
contenido — FinalCta — vive ahora dentro de `the-universe`).

## Cómo reconectar

1. Decidir el nuevo hueco en el recorrido activo (¿vuelve a ser un Acto II
   separado tras "The Universe", o se intercala de otra forma?). Esto
   determina los nuevos índices de capítulo — usa la tabla de arriba solo
   como referencia de los valores relativos, no como índices definitivos.
2. Mover los archivos de vuelta a sus carpetas activas (`components/canvas/scenes/`,
   `components/dom/`, `lib/scroll/`, `data/`) y revertir en cada uno el
   import que ahora apunta a `@/data/archive/act-ii-nffc/...` /
   `@/lib/archive/act-ii-nffc/...` de vuelta a la ruta activa.
3. Añadir sus slugs de vuelta a `lib/scroll/chapterRegistry.js` en la
   posición elegida, y sus entradas a `CHAPTER_DURATIONS` en la misma
   posición.
4. Restaurar (o fusionar con lo que exista entonces) los bloques `CAMERA`
   de la tabla de arriba en `lib/tuning.js`, reindexando threshold/nombres en
   `components/canvas/CameraRig.jsx` — usa `CameraRig.13ch.snapshot.jsx` como
   referencia de la cascada completa de 13 actos.
5. Restaurar los `show*` de `components/canvas/Experience.jsx` — usa
   `Experience.13ch.snapshot.jsx` como referencia.
6. Restaurar los imports/renders en `app/page.js` — usa `page.13ch.snapshot.js`.
7. `GalaxyConnections.jsx`: solo reconectar la variant `"oneUniverse"` tal
   cual; la variant `"galaxiesChains"` quedó superseded por
   `components/canvas/scenes/HubConnections.jsx` del capítulo activo y no
   debería revivirse sin rediseñarla.
8. `ChainsField.jsx`/`RwaNode.jsx`: mismo caso — solo su uso en
   "one-universe" es directamente reconectable; su uso original en el
   capítulo de chains quedó descartado a favor del nuevo diseño de nodos +
   hub.
9. Repetir el traversal completo de ida y vuelta (ver sección Validación de
   `docs/SCROLLYTELLING_BRIEF.md`) tras reconectar, prestando atención a los
   rangos de precalentado de materiales (`showNffc`, etc. en
   `Experience.jsx`).
