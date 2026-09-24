# Brief: landing scrollytelling de somewhere.finance

## Objetivo
Convertir la landing en una experiencia narrativa completa controlada por scroll, no en una landing convencional de hero + cards + features. El usuario debe sentir que viaja por un universo digital generativo. Es a la vez marketplace NFT, ecosistema multichain, visualización de datos financieros y arte generativo.

- Tagline: **Discover NFTs. Across every chain — and beyond.**
- Plataforma agnóstica de blockchain (Ethereum, Solana, BSC, Robinhood). La UI no debe parecer exclusiva de ninguna.
- Idea central: un universo donde conviven colecciones, coleccionables digitales y coleccionables financieros.

## Concepto NFFC
Colecciones NFT concebidas conceptualmente como estructuras similares a un índice: una composición de activos subyacentes (cripto, activos tokenizados, equities tokenizadas, activos estables, otros). Se visualiza como un sistema orbital: el NFFC en el centro y los activos orbitando.
Es solo una metáfora de producto. Sin asesoramiento financiero, sin afirmaciones legales, sin rendimientos inventados, con datos mock claramente marcados.

## Dirección artística
Cosmic + Digital + Financial + Web3 + Luxury Technology. Debe sentirse caro, preciso, minimalista, cinematográfico y tecnológico.
- Ingredientes: partículas, ruido procedural, grids, líneas vectoriales, puntos de datos, fragmentos geométricos, glow/bloom contenido, niebla digital, HUD mínimo, coordenadas, hashes, señales.
- Evitar: cyberpunk genérico, exceso de neón, gradientes baratos, glassmorphism excesivo, UI genérica de startup, dashboards tradicionales, stock imagery, astronautas, planetas realistas, estética gaming.
- Referencias conceptuales: arte generativo, visualización científica, terminales financieras, webs tecnológicas premium, motion editorial.
- Paleta: usa las variables CSS ya definidas en el proyecto (--background, --surface, --surface-muted, --foreground, --foreground-muted, --primary, --primary-dark, --accent, --border). No introduzcas colores aleatorios. Supuesto por defecto: la escena cósmica se muestra siempre en tema oscuro, aunque el resto del sitio tenga modo claro.
  - `--background: #14141F` · `--surface: #343444` · `--surface-muted: #262633` · `--foreground: #FFFFFF` · `--foreground-muted: #BDBDBD` · `--primary: #5142FC` · `--primary-dark: #372E9D` · `--accent: #AF50E5` · `--border: #343444`
  - En los capítulos 1–2 (Singularity, Big Bang) el fondo de la escena puede oscurecerse hacia casi negro, pero siempre derivado de `--background`, nunca con un color nuevo.
  - Acentos puntuales (añadidos en la ronda de revisión creativa del Acto I): `--accent-green: #22C55E` y `--accent-cyan: #22D3EE`. La base de la paleta sigue siendo blanco/`--primary`/`--accent` — estos dos son destellos aislados, nunca un recoloreado general de una escena. Uso previsto:
    - `--accent-green`: pulsos de actividad de mercado (capítulo "The Market Moves") — un tinte breve durante los picos de `data/market.js` `bursts`, no el color permanente del sistema orbital.
    - `--accent-cyan`: conectores HUD (nodo + diagonal + quiebre en ángulo recto, ver `components/dom/EcosystemNodes.jsx`) — dentro de cada cúmulo de "The Galaxies & Chains", cada icono conectado al borde de su propia galaxia, nunca entre cúmulos. También las esquinas bracket de la caja de cada icono. (El acento de mercado, capítulo "The Market Moves", y el uso original de `GalaxyConnections.jsx` para "One Universe" quedaron archivados junto al resto del Acto II/III — ver `docs/ARCHIVED_NFFC_ACT.md`.)
- Tipografía: sans moderna para títulos y monospace para metadata técnica (estilo terminal de lujo, sin abusar). Propón las dos fuentes en la auditoría, con next/font si aplica.

## Arquitectura de scroll (dirección técnica)
- Un único Canvas WebGL persistente (fixed/sticky) con una sola escena "Universe" y capítulos DOM superpuestos.
- Flujo: scroll → progreso global → capítulo activo + progreso local (0–1) → coreografía de cámara + estado de escena + uniforms → overlays DOM.
- Cada capítulo es un módulo de coreografía independiente (cámara, visibilidad de sistemas, uniforms, textos), registrado en un chapter registry. Sin una timeline gigante. Prefiero esto a 10 escenas separadas si es más mantenible; justifícalo en la auditoría.
- Scrub 100 % ligado al scroll: ninguna animación autónoma desconectada del scroll (salvo micro-vida ambiental muy sutil).
- WebGL: partículas, galaxias, nebulosas, órbitas, ADN, transiciones. DOM: titulares, metadata, cards, navegación, CTA, labels. Nunca miles de elementos HTML para partículas.
- Evalúa (sin obligación) si un smooth scroll tipo Lenis mejora la sensación; si lo propones, justifica el peso.
- Móvil: usa unidades svh/dvh (la barra del navegador móvil cambia el viewport), reduce partículas, DPR, shaders y postprocesado, pero mantén la narrativa completa.
- Si existe un enlace de Figma, úsalo como referencia visual. Si no, no lo busques.

## Capítulos
Los textos entre comillas son literales y en inglés. Se pueden fusionar o redistribuir capítulos si mejora la narrativa (justifícalo).

**Restructuración de producto (más reciente):** el recorrido activo se redujo
de 13 a 5 capítulos, terminando en "The Universe" — el Acto II completo
(NFFC como concepto de producto: composición, ficha de identidad, ADN
digital, actividad de mercado, universo del usuario, y el capítulo "One
Universe") quedó **archivado, no eliminado**. Ver `docs/ARCHIVED_NFFC_ACT.md`
para qué se archivó, por qué, sus valores de referencia (duraciones, cámara,
lettering) y cómo reconectarlo cuando el producto esté listo para
retomarlo.

### Capítulos activos
| # | Capítulo | Visual | Copy |
|---|---|---|---|
| 01 | The Singularity | Pantalla casi negra, un punto de luz muy sutil. Al hacer scroll vibra, gana energía, aparecen fragmentos y señales; la cámara se acerca. Genera tensión; muy poca información. | "Everything begins somewhere." |
| 02 | The Big Bang | Uno de los momentos más espectaculares: explosión controlada por scroll con partículas, trails, glow, shockwave, fragmentos, líneas, estructuras geométricas y monedas ETH/BNB/SOL saliendo del núcleo en formato "coin". La cámara retrocede rápido. | "Then everything changed." → "The universe expanded." |
| 03 | The Nebula | Las partículas se agrupan: nebulosas digitales con ruido procedural, campos de energía, nubes, líneas y pequeñas estructuras. Transición hacia el siguiente capítulo con sensación de viaje espacial a alta velocidad (FOV punch + streaks; con reduced motion, transición calmada sin efecto de velocidad). "Tarjetas" NFT placeholder (arte generativo propio) emergen de la nebulosa junto a burbujas de chat ambiental ficticio ("to the moon!", "zero fud", "loool", "farming aura" — insinúa un futuro social-fi, sin funcionalidad real). | "Digital matter began to form." → "Collections emerged." |
| 04 | The Galaxies & Chains | Pantalla dividida en dos galaxias procedurales, una por mitad, diferenciadas por tono dentro de la paleta (izquierda más fría/`--primary`, derecha más cálida/`--accent`). Derecha: siete chains (Ethereum, Solana, BSC, Base, Optimism, Arbitrum, Robinhood). Izquierda: siete empresas con acciones tokenizadas (Tesla, Apple, X, SpaceX, Google, Amazon, Nvidia). Mismo tratamiento de icono (logo real, halo suave) y mismo peso visual en ambos lados. Dentro de cada mitad, líneas finas conectan los iconos al núcleo de su propia galaxia (el punto más brillante ya existente, nunca un vértice inventado) — sin líneas cruzando de un lado a otro. En el centro, una tarjeta oscura con el wordmark "somewhere.finance" como rótulo/divisor, sin conectores propios: su posición entre ambos cúmulos ya transmite la idea. Cámara muy cerca de la escena. Los 14 iconos se proyectan al DOM (no geometría 3D con textura — ver `lib/tuning.js` → `ECOSYSTEM_SCENE` para la justificación de coste). Todos los logos son reales, incluidas las 7 empresas — ver `public/logos/README.md` para la reserva de compliance sobre el uso de esas marcas. | — |
| 05 | The Universe | Cientos o miles de galaxias (sistema LOD); sensación de escala. Lettering: "A universe of digital ownership." → "Across every chain." → "…and beyond." Cierre de TODA la pieza al final de su propio autoplay: las galaxias del LOD convergen hacia el origen (reverso de la expansión del Big Bang, misma fórmula `dirección × distancia`), un destello (`Flash.jsx` reutilizado) y el wordmark + tagline + CTA funcional (`FinalCta.jsx`, sin cambios). Con reduced motion, salto directo al estado final ya resuelto. | "A universe of digital ownership." → "Across every chain." → "…and beyond." → "somewhere" / "Discover NFTs. Across every chain — and beyond." CTA: "Explore somewhere" |

### Archivado (ver `docs/ARCHIVED_NFFC_ACT.md`)
NFFC, The Index, Non-Fungible, Digital DNA, The Market Moves, Your Universe,
One Universe — el Acto II (NFFC como concepto de producto) y el cierre del
Acto III que dependía de él.

## Navegación y microinteracciones
- Navegación mínima integrada en la escena: somewhere, Explore, NFFC, Collections, About, Connect. Fondo transparente, blur sutil, borde fino, tipografía pequeña.
- Microinteracciones sutiles, sin convertir todo en animación: interacción con el cursor (atracción de partículas), distorsión en hover, parallax leve, metadata en hover, respuesta orbital, respuesta de glow, CTA magnético. La jerarquía visual debe seguir clara.

## Datos mock
Estructura en data/chains.js, data/collections.js, data/nffc.js, data/market.js. Sin datos hardcodeados grandes dentro de los componentes. Adapta el formato a la arquitectura real.

## Validación (obligatoria por capítulo)
1. Modo debug solo en desarrollo: un parámetro de URL (por ejemplo ?chapter=07&p=0.5) o un hook `window.__SOMEWHERE_DEBUG__` que fije el progreso de scroll de forma determinista, para poder capturar cada momento con Playwright sin depender de scrolls reales.
2. Playwright: capturas por capítulo en progreso 0, 0.5 y 1, en desktop (1440×900) y móvil (390×844), además de una pasada con reduced motion y un scroll real de punta a punta. Chromium headless suele necesitar flags como `--use-angle=swiftshader --enable-unsafe-swiftshader` para renderizar WebGL; si el canvas sale en blanco, prueba eso antes de suponer que el código está mal.
3. Chrome DevTools: errores de consola, red, memoria y fugas (que el uso no crezca al hacer scroll de ida y vuelta). El FPS en renderizado por software (headless) no es representativo: úsalo solo para detectar regresiones relativas y dime cuándo hace falta que yo mida en mi GPU real.
4. Calidad visual: mira las capturas y critícalas contra este checklist: profundidad, escala, contraste, jerarquía, ritmo/timing y ausencia de estética cyberpunk o demo genérica de Three.js. Itera hasta un máximo de 3 rondas por capítulo y después preséntamelo para aprobación en lugar de seguir refinando sin límite.
