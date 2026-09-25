// Panel de constantes de los capítulos 01-03. Todo lo que antes vivía
// disperso en cada componente (cantidades, intensidades, duraciones, tramos
// de scroll) se centraliza aquí para poder afinar rápido sin bucear en
// shaders. Los componentes leen de aquí; en desarrollo, DevTuning.jsx puede
// sobrescribir una copia en memoria de este mismo objeto (ver ese archivo).

const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

// ---------------------------------------------------------------------------
// 1. Duración (segundos) del autoplay de cada capítulo — antes era longitud
//    de scroll en vh (CHAPTER_VH); con el snap por capítulo, un gesto salta
//    de capítulo y su coreografía se reproduce sola en esta duración fija.
//    Restructuración a 5 capítulos: "nffc" en adelante se archivó (ver
//    docs/ARCHIVED_NFFC_ACT.md, con la tabla de duraciones que tenían esos
//    capítulos por si se reconectan). "the-universe" (05) se alarga mucho
//    (4.2s → 9.5s): antes solo tenía que sostener su propio lettering; ahora
//    también hace de cierre de TODA la pieza (convergencia del LOD, destello,
//    wordmark + CTA reutilizando FinalCta.jsx) — ese cierre entero vivía
//    antes repartido en 8 capítulos separados, así que 9.5s sigue siendo
//    comedido, no un capítulo "hinchado".
// ---------------------------------------------------------------------------
export const CHAPTER_DURATIONS = [
  3.5, // 01 the-singularity
  4.0, // 02 the-big-bang — el más denso: inhalación, flash, doble onda, decaimiento
  3.0, // 03 the-nebula
  5.0, // 04 the-galaxies-and-chains — chains + empresas tokenizadas + hub central
  9.5, // 05 the-universe — exposición + cierre de toda la pieza (ver comentario arriba)
];

// ---------------------------------------------------------------------------
// 1b. Snap: cuánto se ignoran gestos nuevos tras un salto de capítulo (para
//     que varias "muescas" de rueda/trackpad no salten varios capítulos de
//     golpe) y el umbral mínimo de gesto para no disparar con ruido.
// ---------------------------------------------------------------------------
export const SNAP = {
  lockMs: 650,
  wheelThreshold: 4,
  touchThresholdPx: 40,
};

// ---------------------------------------------------------------------------
// 2. Densidad de partículas. Presupuesto CLAUDE.md: ~150k desktop / 30k móvil
//    por escena activa — estos totales (~35k / ~8k) dejan margen amplio.
//    Clases de tamaño: distribución con cola larga (muchas partículas
//    pequeñas, pocas grandes) en vez de un rango uniforme, para que la
//    densidad visual no se sienta plana.
// ---------------------------------------------------------------------------
export const PARTICLES = {
  near: {
    count: isMobile ? 700 : 3200,
    sizeClasses: [
      { size: 3.0, weight: 0.55 },
      { size: 4.6, weight: 0.3 },
      { size: 6.5, weight: 0.12 },
      { size: 9.5, weight: 0.03 },
    ],
    clusterRadius: 1.6,
    spread: 5,
    radiusScale: 0.7,
    fogNear: 2,
    fogFar: 10,
    opacity: 1,
    rotationSpeed: 0.015,
    colorMixRange: [0, 1],
  },
  mid: {
    count: isMobile ? 1800 : 8000,
    sizeClasses: [
      { size: 1.6, weight: 0.6 },
      { size: 2.6, weight: 0.28 },
      { size: 4.0, weight: 0.1 },
      { size: 6.0, weight: 0.02 },
    ],
    clusterRadius: 2.6,
    spread: 8,
    radiusScale: 1.15,
    fogNear: 5,
    fogFar: 17,
    opacity: 0.85,
    rotationSpeed: 0.008,
    colorMixRange: [0, 1],
  },
  far: {
    count: isMobile ? 3600 : 15000,
    sizeClasses: [
      { size: 0.8, weight: 0.65 },
      { size: 1.3, weight: 0.25 },
      { size: 2.1, weight: 0.08 },
      { size: 3.2, weight: 0.02 },
    ],
    clusterRadius: 4,
    spread: 12,
    radiusScale: 1.85,
    fogNear: 9,
    fogFar: 27,
    opacity: 0.5,
    rotationSpeed: 0.004,
    colorMixRange: [0, 1],
  },
  // Capa de polvo: lenta, difusa, tamaños grandes y opacidad baja — aporta
  // volumen ambiental sin leerse como "puntos" individuales.
  dust: {
    count: isMobile ? 1600 : 8500,
    sizeClasses: [
      { size: 6, weight: 0.5 },
      { size: 10, weight: 0.35 },
      { size: 15, weight: 0.15 },
    ],
    clusterRadius: 5,
    spread: 14,
    radiusScale: 2.1,
    fogNear: 10,
    fogFar: 30,
    opacity: 0.16,
    rotationSpeed: 0.002,
    colorMixRange: [0.2, 0.85],
  },
  // Partículas "héroe": muy pocas, grandes, casi blancas puras — puntos de
  // atención que el bloom recoge con fuerza.
  hero: {
    count: isMobile ? 35 : 140,
    sizeClasses: [
      { size: 10, weight: 0.6 },
      { size: 16, weight: 0.4 },
    ],
    clusterRadius: 3,
    spread: 9,
    radiusScale: 1.3,
    fogNear: 6,
    fogFar: 22,
    opacity: 1.3,
    rotationSpeed: 0.006,
    colorMixRange: [0, 0.12],
  },
};

// ---------------------------------------------------------------------------
// 3. Lenguaje "digital": constelación de líneas finas + anillo técnico.
//    Estático (no seguimos la explosión con esto): es textura ambiental,
//    no parte de la narrativa física.
// ---------------------------------------------------------------------------
export const DIGITAL_GRID = {
  pointCount: isMobile ? 26 : 46,
  connectionsPerPoint: 2,
  spread: 13,
  ringPoints: 40,
  ringRadius: 9,
  ringTilt: 0.6,
  opacity: 0.22,
  rotationSpeed: 0.003,
};

// ---------------------------------------------------------------------------
// 4. Singularity (acto 1): curva de crecimiento + "inhalación" final antes
//    del Big Bang.
// ---------------------------------------------------------------------------
export const SINGULARITY = {
  growthPower: 2.0, // p1^growthPower: cuanto mayor, más tardío el crecimiento
  // Tamaño de la esfera de energía en el momento 0 (p1=0, antes de que
  // p1Curve empiece a sumar jitterMax): jitterBase es la ÚNICA constante
  // que la controla ahí — jitterMax domina más tarde. Antes 0.035; reducido
  // ~55% en la ronda de revisión creativa del Acto I para que arranque
  // notablemente más pequeña. Ruta exacta para ajustar en el futuro:
  // lib/tuning.js → SINGULARITY.jitterBase (tamaño) y
  // lib/tuning.js → CAMERA.singularity.zFrom (distancia de cámara al
  // arrancar el capítulo — sin tocar aquí, solo documentado para referencia).
  jitterBase: 0.016,
  jitterMax: 0.3,
  inhaleStart: 0.83, // fracción de p1 en la que empieza la contracción
  inhaleStrength: 0.55, // cuánto se contrae hacia el centro (0-1)
  inhaleFovShrink: 4, // grados que se cierra el FOV durante la inhalación
  inhaleVignetteBoost: 0.25,
  // Sistema de fade por alfa ya existente (nunca THREE.Fog — ver Fase 3a:
  // interactúa mal con el blending aditivo), intensificado solo aquí: a
  // este capítulo le sienta bien más profundidad ya que hay poquísima
  // información en pantalla y el fog ayuda a leer distancia/escala. Se
  // evaluó fog real de three.js primero; se descartó por la misma razón de
  // siempre (lava el aditivo, ensucia el color) — no hay nada específico de
  // este capítulo que cambie esa conclusión, así que se reutiliza el mismo
  // mecanismo ya construido en vez de reabrirlo.
  fogIntensity: 0.97,
};

// ---------------------------------------------------------------------------
// 5. Big Bang (acto 2): doble onda de choque, fragmentos, flash, aberración
//    cromática y sacudida de cámara.
// ---------------------------------------------------------------------------
export const BIGBANG = {
  easePower: 4, // ease-out más agresivo (antes 3): estallido brusco, cola larga
  shockwave1: { maxRadius: 17, delay: 0, power: 3.4 },
  shockwave2: { maxRadius: 24, delay: 0.16, power: 2.6 }, // retrasada y más ancha
  flash: { peakAt: 0.02, sigma: 0.045, intensity: 6.5 }, // antes 4.0
  fragments: {
    count: isMobile ? 22 : 46, // por forma (tetraedro/lámina)
    maxDistance: 26,
    scaleRange: [0.22, 0.85], // antes 0.18-0.5: fragmentos más grandes
  },
  chromaticAberration: {
    enabled: !isMobile, // coste bajo pero se omite en móvil por presupuesto
    peakOffset: 0.006,
    decayEnd: 0.22, // fracción de p2 en la que desaparece del todo
  },
  cameraShake: {
    magnitude: 0.22,
    decayEnd: 0.5,
    frequency: 18,
  },
  // Monedas ETH/BNB/SOL saliendo del núcleo (ronda de revisión creativa del
  // Acto I). Robinhood no tiene logo propio de chain (ya establecido en
  // public/logos/README.md) — no se incluye aquí.
  //
  // Elegido sprite instanciado + shader de borde/reflejo (CoinMaterial.js)
  // en vez de geometría 3D real (cilindro biselado): con cámara temblando,
  // shockwave doble, flash, fragmentos y aberración cromática ya activos a
  // la vez, el presupuesto de este capítulo concreto es el más ajustado de
  // toda la pieza — un sprite plano sin luces reales es ~la mitad de barato
  // que un cilindro con normal map/specular, y con solo 3-4 monedas por
  // chain girando en 3D real (no billboard: sí rotan de verdad, así que se
  // ven de canto como una moneda lanzada) el ojo no distingue la diferencia
  // en un capítulo de menos de 4s con esta cantidad de movimiento. También
  // reutiliza directamente los SVG ya sourceados (sin retexturizar activos).
  coins: {
    enabled: !isMobile, // sistema decorativo adicional: fuera del presupuesto móvil
    instancesPerChain: 3,
    maxDistance: 19,
    scaleRange: [0.55, 0.85],
    coinColor: "#343444", // var(--surface): base neutra, el logo aporta el color
  },
};

// ---------------------------------------------------------------------------
// 5a2. Transición 02→03 (ronda de revisión creativa del Acto I): "viaje
//      espacial a alta velocidad" — FOV punch (CameraRig.jsx) + streaks
//      radiales (WarpStreaks.jsx), los dos como un pico gaussiano breve
//      justo al entrar en la Nebula. Con prefers-reduced-motion no se
//      aplica ninguno de los dos (gate en cada componente): la cámara pasa
//      directo al encuadre final de la Nebula, sin sensación de velocidad.
// ---------------------------------------------------------------------------
export const NEBULA_ENTRY = {
  fovPunch: 34, // grados extra de FOV en el pico del "lurch" de cámara
  sigma: 0.12, // anchura del pico gaussiano (fracción del progreso local del capítulo 3)
  streakCount: isMobile ? 0 : 60,
  streakDistanceRange: [8, 34],
  streakLengthRange: [3, 9],
};

// ---------------------------------------------------------------------------
// 5b. Galaxies (acto 4): forma de la galaxia en la que colapsa la nebulosa.
//     Mismos parámetros que consume lib/shaders/galaxy.js para las
//     colecciones/chains/LOD — aquí es el objetivo de mezcla final de
//     UniverseParticleMaterial (ver uProgress4).
// ---------------------------------------------------------------------------
export const GALAXY_MORPH = {
  armCount: 4,
  tightness: 3.6,
  radius: 14,
  thickness: 0.22,
  noiseAmount: 0.08,
  rotationSpeed: 0.045,
};

// ---------------------------------------------------------------------------
// 5c. ARCHIVADO (ver docs/ARCHIVED_NFFC_ACT.md) — solo lo usa
//     components/archive/act-ii-nffc/scenes/CollectionsField.jsx si se
//     reconecta "one-universe". Ninguna escena activa la importa. Se
//     mantiene aquí (en vez de moverla) porque no está acoplada a un índice
//     de capítulo, así que no hay riesgo de que quede desalineada.
// ---------------------------------------------------------------------------
export const COLLECTIONS_SCENE = {
  particleCount: isMobile ? 220 : 650,
  sizeRange: [1.4, 3.2],
  appearStart: 0.2,
  appearEnd: 0.75,
  staggerPerGalaxy: 0.06,
};

// ---------------------------------------------------------------------------
// 5d. ARCHIVADO — solo lo usa
//     components/archive/act-ii-nffc/scenes/ChainsField.jsx (galaxias
//     procedurales completas por chain; superseded en el capítulo activo por
//     ECOSYSTEM_SCENE + EcosystemField.jsx, mucho más barato). Ver comentario
//     de 5c.
// ---------------------------------------------------------------------------
export const CHAINS_SCENE = {
  particleCount: isMobile ? 260 : 800,
  sizeRange: [1.3, 3.0],
};

// ---------------------------------------------------------------------------
// 5d2. ARCHIVADO — solo lo usa
//      components/archive/act-ii-nffc/scenes/RwaNode.jsx. El concepto de
//      nodo "real world assets" se descartó para el capítulo activo (ver
//      docs/SCROLLYTELLING_BRIEF.md): ahora el hub central conecta
//      directamente chains ↔ empresas tokenizadas, sin un tercer nodo
//      abstracto de por medio.
// ---------------------------------------------------------------------------
export const RWA_SCENE = {
  particleCount: isMobile ? 220 : 650,
  sizeRange: [1.4, 3.0],
};

// ---------------------------------------------------------------------------
// 5e. "The Galaxies & Chains" (acto 4 — corrección de composición sobre la
//     restructuración a 5 capítulos, ver docs/ARCHIVED_NFFC_ACT.md): pantalla
//     dividida en dos cúmulos, cada uno su propia galaxia procedural (mismo
//     Galaxy.jsx/GalaxyMaterial que ya usa el LOD de "the-universe" — nunca
//     un sistema nuevo), diferenciados por tono dentro de la paleta
//     (`colorMix` bajo = frío/primary, alto = cálido/accent — nunca los
//     naranjas/rosas literales de una referencia de maqueta). Los 14 iconos
//     (logos reales, ver public/logos/README.md) se proyectan al DOM vía
//     cameraBridge — mismo mecanismo que ya usaban las etiquetas de chain —
//     en vez de geometría 3D con textura por icono: con 14 posiciones fijas
//     y logos reales, el coste es un puñado de <img> posicionados por rAF,
//     cero draw calls adicionales y cero riesgo de mezclar texto/logo dentro
//     del canvas (regla no negociable de CLAUDE.md).
//
//     Iteración HUD sci-fi (segunda corrección): cada icono orbita su
//     galaxia (`orbit`, ver EcosystemNodes.jsx) y el conector pasa de línea
//     recta 3D a un trazado tipo HUD (nodo + diagonal corta + quiebre en
//     ángulo recto) construido en espacio de PANTALLA, no en el mundo 3D —
//     un ángulo recto en 3D no se proyecta como ángulo recto en pantalla
//     bajo perspectiva, así que ese trazado vive ahora como SVG dentro de
//     EcosystemNodes.jsx (mismo layer DOM que ya proyecta los iconos) en vez
//     de components/canvas/scenes/EcosystemConnections.jsx (retirado —
//     superseded, no archivado: nunca llegó a una entrega estable antes de
//     esta corrección).
// ---------------------------------------------------------------------------
export const ECOSYSTEM_SCENE = {
  particleCount: isMobile ? 700 : 1800,
  sizeRange: [1.3, 3.2],
  revealDuration: 0.3, // fracción del acto 4 en la que entran todos los iconos a la vez
  iconSizePx: 34,
  // Órbita pequeña y lenta de cada icono alrededor de su offset base (ver
  // data/chains.js/companies.js) — fase y velocidad varían por icono
  // (derivadas del índice en EcosystemNodes.jsx) para que no se vean
  // sincronizadas. Con prefers-reduced-motion se congela en 0 (offset base
  // puro, sin oscilación) — la caja y la etiqueta se quedan.
  orbit: {
    radius: 0.9, // unidades de mundo — pequeño, un "temblor" orbital, no un desplazamiento grande
    speed: 0.25, // rad/s base (cada icono aplica su propio multiplicador)
  },
  // Conector HUD (EcosystemNodes.jsx, SVG en espacio de pantalla): nodo en
  // el borde del cúmulo (radius de la galaxia, en la dirección del offset
  // BASE del icono, sin la órbita — el ancla no tiembla, solo el extremo del
  // icono) → tramo diagonal corto → quiebre recto → caja del icono.
  connector: {
    diagPx: 22, // longitud horizontal del tramo diagonal antes del quiebre
    nodeRadiusPx: 3,
  },
  // Opacidad del trazo SVG del conector (0-1, alpha plano) — distinta de la
  // que tenía la línea 3D retirada (esa iba con blending aditivo en WebGL,
  // donde un valor bajo ya se veía brillante; un trazo SVG normal necesita
  // más para leerse con la misma claridad).
  connectorLineOpacity: 0.55,
  companies: {
    position: [-13, 0, 9],
    // Ángulo fijo de partida por eje [x, y, z] en radianes (Math.PI = 180°,
    // Math.PI/2 = 90°) y giro continuo por eje [x, y, z] en radianes/segundo
    // (0,0,0 = quieta salvo el remolino de rotationSpeed) — leídos por
    // Galaxy.jsx, no por el shader. Independientes de rotationSpeed (ese
    // gira los BRAZOS dentro de la galaxia; estos dos giran/orientan el
    // disco entero, en cualquier eje, no solo Y).
    groupRotation: [Math.PI / 3, Math.PI, Math.PI / 2],
    driftSpeed: [0, 0, 0],
    armCount: 6,
    tightness: 3.2,
    radius: 7,
    thickness: 0.16,
    noiseAmount: 0.07,
    rotationSpeed: 0.05,
    coreSize: 0.24,
    colorMix: 4, // frío, casi blanco/--primary puro
    particleScale: 1.0,
  },
  chains: {
    position: [13, 0, -6],
    groupRotation: [Math.PI / 3, Math.PI, 0],
    driftSpeed: [0, 0, 0],
    armCount: 6,
    tightness: 3.2,
    radius: 7,
    thickness: 0.16,
    noiseAmount: 0.07,
    rotationSpeed: 0.05,
    // Nota: el uniform "accent" de GalaxyMaterial.js es cian (#16efff), no
    // el --accent morado de tokens.css — llevar colorMix cerca de 1 aquí
    // teñiría TODA la galaxia de cian, violando la regla de que el cian es
    // solo un acento puntual (nunca un recoloreado general de escena). Se
    // limita a 0.4 para quedarse dentro del tramo blanco→primary con solo
    // una insinuación de ese tono, nunca un cian dominante.
    coreSize: 0.24,
    colorMix: 0.4,
    particleScale: 1.0,
  },
};

// ---------------------------------------------------------------------------
// 5f. Universe (acto 5): LOD — pocas galaxias cercanas con partículas reales
//     + muchas lejanas como billboards instanciados baratos (espiral pintada
//     en el fragment shader). Ver GalaxyField.jsx para el porqué de este
//     reparto y sus límites reales (culling por mesh, no por instancia).
// ---------------------------------------------------------------------------
export const UNIVERSE_LOD = {
  near: {
    galaxyCount: isMobile ? 4 : 9,
    particlesPerGalaxy: isMobile ? 160 : 420,
    fieldRadius: 26,
  },
  far: {
    instanceCount: isMobile ? 300 : 1400,
    fieldRadiusMin: 30,
    fieldRadiusMax: 140,
    billboardSize: [2.2, 4.8],
  },
};

// ---------------------------------------------------------------------------
// 5f2. Cierre de "The Universe" (acto 5 — restructuración a 5 capítulos):
//      tras el lettering normal del capítulo, las galaxias del LOD
//      (UniverseField.jsx) convergen hacia el origen — reverso literal de
//      cómo Fragments/Trails/CoinBurst se ALEJAN del origen en el Big Bang
//      (misma fórmula `direction * distancia`, aquí con la distancia
//      encogiendo hacia 0 en vez de creciendo) — seguido de un destello
//      (Flash.jsx reutilizado, ver getFlashPeak en ese archivo) y la
//      revelación de FinalCta.jsx (wordmark + tagline + CTA, sin cambios).
//      Con prefers-reduced-motion, useChapterNavigation ya salta
//      chapterProgress directo a 1 al entrar en el capítulo (mismo mecanismo
//      que el resto de la pieza) — como toda esta secuencia está impulsada
//      por chapterProgress (nunca por tiempo de reloj), el resultado es
//      automáticamente el estado final ya resuelto, sin animación de
//      aglomerado y sin lógica especial adicional aquí.
// ---------------------------------------------------------------------------
export const UNIVERSE_ENDING = {
  convergeStart: 0.62, // fracción del progreso del acto 5 en la que empiezan a converger las galaxias del LOD
  convergeEnd: 0.88,
  flashPeakAt: 0.88, // mismo instante en que termina la convergencia
  flashSigma: 0.05,
  ctaRevealAt: 0.9, // FinalCta aparece justo tras el destello
};

// ---------------------------------------------------------------------------
// 5g. ARCHIVADO (ver docs/ARCHIVED_NFFC_ACT.md) — Sistema orbital del NFFC.
//     Solo lo usa components/archive/act-ii-nffc/scenes/NffcSystem.jsx si se
//     reconecta el Acto II. Ver comentario de 5c.
// ---------------------------------------------------------------------------
export const NFFC_SYSTEM = {
  instanceCount: isMobile ? 72 : 216,
  nodeSize: 0.42,
  jitterAmount: 0.06,
  jitterFrequency: 0.6,
  groupRotationSpeed: 0.025,
  galaxyScatter: { armCount: 3, tightness: 2.2, radius: 7 },
  helixLayers: [
    "artwork",
    "metadata",
    "ownership",
    "history",
    "underlying assets",
    "collection identity",
  ],
  // Acto 11 (Your Universe, antes 12): mismo mecanismo que la composición de
  // un NFFC (buildOrbitalLayout), pero representando las categorías de una
  // cuenta de usuario en vez de los activos subyacentes de un NFFC concreto.
  // Mock, "Illustrative data" — nunca cifras reales de ningún usuario.
  yourUniverseCategories: [
    { asset: "NFTS", weight: 34, color: "#5142fc" },
    { asset: "COLLECTIONS", weight: 26, color: "#af50e5" },
    { asset: "NFFCS", weight: 22, color: "#ffffff" },
    { asset: "CHAINS", weight: 18, color: "#8a92b2" },
  ],
};

// ---------------------------------------------------------------------------
// 6. Cámara: rangos y curvas de easing por acto, deriva de mano y parallax.
// ---------------------------------------------------------------------------
export const CAMERA = {
  singularity: { zFrom: 14, zTo: 8, fovFrom: 32, fovTo: 28, ease: 1.6 },
  // Ronda de revisión creativa del Acto I: zTo acercado de 46 a 36 (más
  // cerca de la materia espacial durante todo el retroceso) y orbitMax
  // nuevo (ángulo leve, antes 0 — la cámara no giraba nada durante el Big
  // Bang). nebula.zFrom/fovFrom se actualizan a la vez para mantener la
  // continuidad entre actos (regla ya establecida: cada acto empieza donde
  // termina el anterior).
  bigbang: { zFrom: 8, zTo: 36, fovFrom: 28, fovTo: 72, ease: 1.8, rollMax: 0.05, orbitMax: 0.1 },
  nebula: { zFrom: 36, zTo: 52, fovFrom: 72, fovTo: 58, ease: 1.3, orbitMax: 0.35 },
  // Acto 4 ("The Galaxies & Chains" — corrección de composición): dos
  // galaxias-cúmulo, cámara más cerca todavía que la versión anterior de este
  // capítulo (zTo 44 → 36 en desktop) para que ambas se lean como el
  // protagonista de la pantalla, no como puntos lejanos. approachDepth: el
  // mismo "bache" de acercamiento a mitad de capítulo de siempre.
  //
  // zTo/fovTo distintos en móvil: esta composición es mucho más ANCHA que
  // cualquier capítulo anterior (dos cúmulos a ±13-19 unidades) — en un
  // viewport alto y estrecho (retrato), el mismo fov vertical deja mucho
  // menos fov HORIZONTAL visible que en desktop (fov horizontal depende del
  // aspect ratio), así que en un móvil real la mayoría de los iconos
  // quedaban fuera de encuadre. Se compensa con cámara más lejos + fov mayor
  // en móvil, sacrificando un poco de "cercanía" por mantener la narrativa
  // completa visible (regla de CLAUDE.md), verificado con capturas reales a
  // 390×844 en docs/captures/.
  galaxiesChains: {
    zFrom: 52,
    zTo: isMobile ? 62 : 36,
    fovFrom: 58,
    fovTo: isMobile ? 72 : 64,
    ease: 1.3,
    approachDepth: 8,
  },
  // Acto 5 ("The Universe"): retroceso para la sensación de escala del LOD,
  // luego cierre de toda la pieza (ver UNIVERSE_ENDING) — la cámara se
  // mantiene en su valor final (zTo/fovTo) durante el cierre, ya que ahí el
  // movimiento lo aportan las galaxias convergiendo, no la cámara.
  // zFrom/fovFrom ajustados a la continuidad con el nuevo acto 4 (mismo valor
  // que su zTo/fovTo, en cada plataforma).
  universe: {
    zFrom: isMobile ? 62 : 36,
    zTo: 150,
    fovFrom: isMobile ? 72 : 64,
    fovTo: 80,
    ease: 1.6,
    orbitMax: 0.5,
  },
  smoothing: 0.12,
  handheld: { amplitude: 0.045, frequencyX: 0.6, frequencyY: 0.45 },
  pointerParallax: isMobile ? 0 : 0.35,
};

// ---------------------------------------------------------------------------
// 7. Postprocesado. Umbral alto a propósito: el bloom se reserva para picos
//    reales (flash, shockwave), no para un resplandor ambiental constante.
// ---------------------------------------------------------------------------
export const POSTFX = {
  bloom: {
    intensity: isMobile ? 0.3 : 0.5,
    luminanceThreshold: 0.4,
    luminanceSmoothing: 0.2,
    radius: isMobile ? 0.3 : 0.4,
    mipmapBlur: !isMobile,
  },
  vignette: { offset: 0.25, darkness: 0.55 },
  // opacity base del grano: GRAIN_BY_CHAPTER (más abajo) lo sustituye por
  // capítulo; este valor solo se usa como fallback antes del primer frame.
  noise: { opacity: 0.025 },
};

// ---------------------------------------------------------------------------
// 7b. Filtro cinematográfico (Interludio, parte B). Todo construido con
//     efectos ya incluidos en `postprocessing`/`@react-three/postprocessing`
//     (ToneMapping, BrightnessContrast, HueSaturation, LensFlare) — sin LUTs
//     de terceros ni shaders nuevos.
//
//     Limitación conocida y asumida: un tinte real de negros hacia
//     --background necesitaría una curva de color/LUT dedicada (fuera de
//     alcance aquí); se aproxima con ACESFilmic + contraste/saturación
//     sutiles, que ya dan el "look" de cámara sin ese coste.
// ---------------------------------------------------------------------------
export const CINEMATIC = {
  grade: {
    enabled: true,
    // "S-curve" sutil: un pelín de contraste, brillo levemente por debajo de
    // cero (evita blancos sucios/grises, deja negros limpios) y saturación
    // levemente reducida en vez de un true "desaturado solo en sombras"
    // (requeriría una curva por luminancia dedicada).
    contrast: isMobile ? 0.05 : 0.07,
    brightness: -0.02,
    saturation: isMobile ? -0.05 : -0.08,
  },
  // Grano de película por capítulo: más presente en actos oscuros/tensos,
  // casi imperceptible en los luminosos. Intensificado en la ronda de
  // revisión creativa del Acto I (antes se notaba demasiado poco para
  // leerse como "efecto de película" — ~1.45x sobre los valores previos,
  // tope en 0.046 para no cruzar a ruidoso/sucio; ver capturas de
  // docs/captures/ antes/después de esta ronda).
  // 5 valores (restructuración a 5 capítulos: "nffc" en adelante se
  // archivó, ver docs/ARCHIVED_NFFC_ACT.md). "the-universe" (05) sube un
  // poco respecto al valor "expansivo" que tenía antes (0.022 → 0.03): ahora
  // también sostiene el cierre de toda la pieza (convergencia + destello +
  // wordmark), un tramo más contemplativo que merece un poco más de grano
  // que la exposición inicial del capítulo, sin llegar al nivel de la Nebula.
  grainByChapter: [
    0.046, // 01 the-singularity — oscuro, tenso
    0.038, // 02 the-big-bang — el flash ya aporta mucho contraste, menos grano
    0.044, // 03 the-nebula — oscuro, denso
    0.027, // 04 the-galaxies-and-chains — luminoso, colorido
    0.03, // 05 the-universe — expansivo al empezar, contemplativo en el cierre
  ].map((v) => (isMobile ? v * 0.6 : v)),
  letterbox: {
    // Barras negras DOM/CSS, no permanentes: solo en momentos climáticos.
    enabled: !isMobile, // en móvil ya hay menos alto útil; se omite
    maxHeightVh: 6,
    bigBangHoldMs: 250, // margen extra tras el pico antes de empezar a retraerse
    snapAccentMs: 220, // acento breve al entrar a cualquier capítulo
    snapAccentScale: 0.4, // el acento de snap es más discreto que el del Big Bang
  },
  lensFlare: {
    // Streak anamórfico propio (LensStreak.jsx / LensStreakMaterial.js), no
    // el efecto `LensFlare` de @react-three/postprocessing: ese pilota su
    // propia opacidad vía oclusión (pensado para un sol 3D) y no se puede
    // atar de forma fiable al pico del flash — ver el comentario en
    // LensStreakMaterial.js. Solo visible en el pico del Big Bang.
    enabled: !isMobile,
    // El pico real de getFlashPeak() llega a 1.0; se escala para que el
    // streak quede como acento discreto, no como un segundo flash.
    maxOpacity: 0.4,
  },
};

// ---------------------------------------------------------------------------
// 8. Lettering de los capítulos 01-03. Cada frase define su propio tramo
//    (entrada/salida) en el progreso local de `chapter` (0-1, getActProgress).
//    `enterChapter`/`exitChapter` son opcionales y solo hacen falta cuando
//    una frase empieza en un acto y termina en el siguiente (ver ch2-a: nace
//    en la inhalación del acto 1 y se apaga con el flash del acto 2) — fuera
//    de esos actos, `enter`/`exit` se resuelven a 0 o 1 automáticamente
//    (getActProgress ya satura así), así que no hace falta lógica especial.
// ---------------------------------------------------------------------------
export const LETTERING = {
  entryOffsetPx: 26, // desplazamiento vertical inicial (se anula con reduced motion)
  entryLetterSpacingEm: 0.16, // espaciado ancho inicial, se asienta a settledLetterSpacingEm
  settledLetterSpacingEm: 0,
  phrases: [
    {
      id: "ch1-a",
      chapter: 0,
      kicker: "",
      text: "Everything begins somewhere.",
      enterStart: 0.06,
      enterEnd: 0.2,
      exitStart: 0.64,
      exitEnd: 0.78, // se apaga antes de inhaleStart (0.83): la contracción se queda sola
    },
    {
      id: "ch2-a",
      chapter: 1,
      enterChapter: 0, // nace en el acto 1 (inhalación)
      exitChapter: 1, // y se apaga ya en el acto 2 (flash)
      kicker: "",
      text: "A place where everything happens...",
      enterStart: 0.86, // tras SINGULARITY.inhaleStart (0.83)
      enterEnd: 0.97,
      exitStart: 0.0,
      exitEnd: 0.03, // justo en BIGBANG.flash.peakAt (0.02): el estallido puntúa la frase
    },
    {
      id: "ch2-b",
      chapter: 1,
      exitChapter: 2, // frase final del capítulo: se sostiene hasta el cambio al 03
      kicker: null, // segunda frase del mismo capítulo: sin repetir kicker
      text: "Metaversal matter takes real form.",
      enterStart: 0.58, // después del pico de las dos ondas de choque
      enterEnd: 0.7,
      exitStart: 0.0,
      exitEnd: 0.03,
    },
    {
      id: "ch3-a",
      chapter: 2,
      kicker: "",
      text: "The hard mode became social.",
      enterStart: 0.08,
      enterEnd: 0.3,
      exitStart: 0.44,
      exitEnd: 0.59,
    },
    {
      id: "ch3-b",
      chapter: 2,
      exitChapter: 3, // frase final del capítulo: se sostiene hasta el cambio al 04
      kicker: null,
      text: "The Collectibles emerged from Crypto, and Stocks.",
      enterStart: 0.6,
      enterEnd: 0.72,
      exitStart: 0.0,
      exitEnd: 0.03,
    },
    // Capítulo 04 (fusionado Galaxies+Chains — ronda de revisión creativa
    // del Acto I, punto 7: antes dos kickers separados, "04 — THE GALAXIES"
    // y "05 — THE CHAINS", en dos capítulos distintos): sin frase, solo el
    // kicker discreto (text: null hace que ChapterLettering.jsx promueva el
    // kicker a <h2> por accesibilidad).
    {
      id: "ch4-kicker",
      chapter: 3,
      exitChapter: 4, // frase final del capítulo: se sostiene hasta el cambio al 05
      kicker: "",
      text: "To evolve the on chain property",
      enterStart: 0.03,
      enterEnd: 0.12,
      exitStart: 0.0,
      exitEnd: 0.03,
    },
    {
      id: "ch5-a",
      chapter: 4,
      kicker: "",
      text: "A universe of digital ownership.",
      enterStart: 0.05,
      enterEnd: 0.14,
      exitStart: 0.26,
      exitEnd: 0.34,
    },
    {
      id: "ch5-b",
      chapter: 4,
      kicker: null,
      text: "Across every chain...",
      enterStart: 0.38,
      enterEnd: 0.46,
      exitStart: 0.56,
      exitEnd: 0.62,
    },
    {
      id: "ch5-c",
      chapter: 4,
      kicker: null,
      // Continuación visual de "Across every chain.": mismo estilo, sin
      // kicker, entra casi pegada a la salida de la frase anterior. Es una
      // insinuación ("y más allá"), no una promesa de activos ni datos
      // financieros — eso es terreno del Acto II (NFFC).
      text: "Trought all worlds.",
      enterStart: 0.58,
      enterEnd: 0.64,
      // Último capítulo: no hay cambio de escena después, así que se
      // sostiene hasta el destello del cierre (UNIVERSE_ENDING.flashPeakAt,
      // 0.88) y deja el sitio libre al wordmark + CTA (ctaRevealAt 0.9).
      exitStart: 0.84,
      exitEnd: 0.88,
    },
    // ch5-brand ("somewhere" + tagline, antes aquí) se retiró en la
    // restructuración a 5 capítulos: competía con el wordmark real del
    // cierre de este mismo capítulo (FinalCta.jsx, ver UNIVERSE_ENDING) —
    // el brief de la restructuración solo pide mantener ch5-a/b/c, no esta
    // frase. El Acto II completo (NFFC en adelante, capítulos 06-12 que
    // existían aquí) se archivó — ver docs/ARCHIVED_NFFC_ACT.md.
  ],
};

export { isMobile };
