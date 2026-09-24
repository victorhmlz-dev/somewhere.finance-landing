// Datos mock del cúmulo "empresas con acciones tokenizadas" del capítulo
// activo "The Galaxies & Chains" (mitad izquierda) — mismo peso visual entre
// todas, mismo formato que las chains (icono + etiqueta), sin jerarquía.
//
// `offset` es RELATIVO al centro de la galaxia (ECOSYSTEM_SCENE.companies.position
// en lib/tuning.js), no una posición absoluta en el mundo — la posición real
// de cada icono se calcula en cada frame como
// ECOSYSTEM_SCENE.companies.position + offset + (temblor orbital, ver
// EcosystemNodes.jsx). Así, si mueves el centro de la galaxia en tuning.js,
// los iconos y sus conectores HUD la siguen automáticamente sin tocar este
// archivo.
//
// `symbol`: micro-etiqueta monoespaciada (2-4 caracteres) dentro de la caja
// HUD de cada icono — el ticker bursátil real, coherente con "acciones
// tokenizadas".
//
// Logos reales (corrección de composición sobre la restructuración a 5
// capítulos): a diferencia de los ecosistemas cripto de data/chains.js, no
// encontré un brand-kit público de ninguna de estas 7 marcas que autorice
// explícitamente su uso en un producto no afiliado — son marcas de consumo
// con políticas mucho más restrictivas. Se usa igualmente el icono real
// (instrucción explícita), vía Simple Icons (simpleicons.org), con la
// reserva de compliance documentada en public/logos/README.md: confirma el
// uso antes de un lanzamiento real, no solo de un demo.
export const COMPANIES = [
  {
    id: "tesla",
    label: "TESLA",
    logo: "/logos/tesla-mark-red.svg",
    symbol: "TSLA",
    offset: [4, 4, -12],
  },
  {
    id: "apple",
    label: "APPLE",
    logo: "/logos/apple-mark-white.svg",
    symbol: "AAPL",
    offset: [3, -8, -5],
  },
  {
    id: "x",
    label: "X",
    logo: "/logos/x-mark-white.svg",
    symbol: "X",
    offset: [-4, 3, -11],
  },
  {
    id: "spacex",
    label: "SPACEX",
    logo: "/logos/spacex-mark-white.svg",
    symbol: "SPCX",
    offset: [-1, 6, -6],
  },
  {
    id: "google",
    label: "GOOGLE",
    logo: "/logos/google-mark-white.svg",
    symbol: "GOOG",
    offset: [-6, -3, -10],
  },
  {
    id: "amazon",
    label: "AMAZON",
    logo: "/logos/amazon-mark-orange.svg",
    symbol: "AMZN",
    offset: [2, -2, -5],
  },
  {
    id: "nvidia",
    label: "NVIDIA",
    logo: "/logos/nvidia-mark-green.svg",
    symbol: "NVDA",
    offset: [-5, -6, -14],
  },
];
