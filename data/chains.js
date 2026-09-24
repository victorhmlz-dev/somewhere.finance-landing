// Datos mock de los siete ecosistemas del cúmulo "chains" del capítulo
// activo "The Galaxies & Chains" (mitad derecha). Identidades puramente
// visuales — nunca logos inventados, nunca propiedades técnicas reales,
// nunca jerarquía entre ellas: mismo peso visual, mismo formato (icono +
// etiqueta, ver EcosystemNodes.jsx).
//
// `offset` es RELATIVO al centro de la galaxia (ECOSYSTEM_SCENE.chains.position
// en lib/tuning.js), no una posición absoluta en el mundo — la posición real
// de cada icono se calcula en cada frame como
// ECOSYSTEM_SCENE.chains.position + offset + (temblor orbital, ver
// EcosystemNodes.jsx). Así, si mueves el centro de la galaxia en tuning.js,
// los iconos y sus conectores HUD la siguen automáticamente sin tocar este
// archivo.
//
// `symbol`: micro-etiqueta monoespaciada (2-4 caracteres) dentro de la caja
// HUD de cada icono — símbolo/ticker corto, no el nombre completo.
//
// Los campos armCount/tightness/etc. (usados por la galaxia procedural
// completa que tenía este capítulo antes de la restructuración) ya no los
// consume ninguna escena activa — se conservan tal cual porque
// components/archive/act-ii-nffc/scenes/ChainsField.jsx los sigue
// necesitando si "one-universe" se reconecta (ver docs/ARCHIVED_NFFC_ACT.md).
export const CHAINS = [
  {
    id: "ethereum",
    label: "ETHEREUM",
    // Logo del token (el diamante ETH), no el de la fundación. Colores
    // originales de marca, sin forzar a la paleta — ver public/logos/README.md
    // para la fuente exacta de cada archivo.
    logo: "/logos/eth-diamond-purple.svg",
    // Estructuras geométricas y densas, tonos fríos.
    armCount: 7,
    tightness: 4.2,
    radius: 9,
    thickness: 0.12,
    noiseAmount: 0.05,
    rotationSpeed: 0.05,
    coreSize: 0.16,
    colorMix: 0.1, // frío: blanco/primary
    particleScale: 1.1,
    offset: [-4, 4, 3],
    symbol: "ETH",
  },
  {
    id: "solana",
    label: "SOLANA",
    logo: "/logos/solana-logomark.svg",
    // Líneas rápidas, movimiento, estructuras dinámicas.
    armCount: 2,
    tightness: 2.4,
    radius: 10,
    thickness: 0.06,
    noiseAmount: 0.06,
    rotationSpeed: 0.34,
    coreSize: 0.12,
    colorMix: 0.55,
    particleScale: 0.85,
    offset: [-1, -5, 8],
    symbol: "SOL",
  },
  {
    id: "bsc",
    label: "BSC",
    logo: "/logos/bnb-symbol-yellow.svg",
    // Estructuras más compactas.
    armCount: 4,
    tightness: 3.4,
    radius: 5.5,
    thickness: 0.16,
    noiseAmount: 0.08,
    rotationSpeed: 0.1,
    coreSize: 0.26,
    colorMix: 0.4,
    particleScale: 0.85,
    offset: [4, 3, 4],
    symbol: "BSC",
  },
  {
    id: "base",
    label: "BASE",
    logo: "/logos/base-square-blue.svg",
    // Minimalista: pocos brazos, muy apretados — lee "limpio" y ordenado,
    // coherente con la identidad de marca de Base (icono único, sin ruido).
    armCount: 2,
    tightness: 5.0,
    radius: 6,
    thickness: 0.08,
    noiseAmount: 0.03,
    rotationSpeed: 0.15,
    coreSize: 0.3,
    colorMix: 0.2,
    particleScale: 0.9,
    offset: [1, 6, 9],
    symbol: "BASE",
  },
  {
    id: "optimism",
    label: "OPTIMISM",
    logo: "/logos/optimism-symbol.svg",
    // Energética, brazos más sueltos y numerosos — dentro de la misma
    // paleta blanco/primary/accent (el rojo de marca lo aporta solo el
    // icono, no la galaxia procedural, igual que ETH/SOL/BNB).
    armCount: 6,
    tightness: 2.0,
    radius: 7.5,
    thickness: 0.2,
    noiseAmount: 0.12,
    rotationSpeed: 0.12,
    coreSize: 0.18,
    colorMix: 0.6,
    particleScale: 1.0,
    offset: [6, -3, 5],
    symbol: "OP",
  },
  {
    id: "arbitrum",
    label: "ARBITRUM",
    logo: "/logos/arbitrum-symbol.svg",
    // Rápida y dinámica, capas superpuestas.
    armCount: 3,
    tightness: 3.8,
    radius: 8,
    thickness: 0.1,
    noiseAmount: 0.06,
    rotationSpeed: 0.22,
    coreSize: 0.2,
    colorMix: 0.45,
    particleScale: 0.95,
    offset: [-2, -2, 10],
    symbol: "ARB",
  },
  {
    id: "robinhood",
    label: "ROBINHOOD",
    // Antes sin logo (Robinhood Chain no tiene marca propia distinta del
    // icono de la app de trading, la pluma) — por instrucción explícita se
    // usa igualmente ese icono corporativo aquí. Ver public/logos/README.md
    // para el historial de esta decisión.
    logo: "/logos/robinhood.png",
    // Estética distinta pero integrada: disco suave sin bandas de brazos
    // marcadas (armCount alto homogeneiza la espiral en un disco).
    armCount: 20,
    tightness: 1.4,
    radius: 8,
    thickness: 0.24,
    noiseAmount: 0.1,
    rotationSpeed: 0.07,
    coreSize: 0.22,
    colorMix: 0.68, // único que se apoya más en accent, sigue en paleta
    particleScale: 1.0,
    offset: [7, -7, 0],
    symbol: "RH",
  },
];
