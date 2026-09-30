// Datos mock del cúmulo "empresas con acciones tokenizadas" del capítulo
// activo "The Galaxies & Chains" (mitad izquierda) — mismo peso visual entre
// todas, mismo formato que las chains (icono + etiqueta), sin jerarquía.
//
// Posición: cada icono recorre uno de los anillos orbitales de la galaxia
// (ECOSYSTEM_SCENE.orbits en lib/tuning.js). El anillo y la fase inicial se
// asignan solos según el orden de este array (alternos entre anillos,
// equiespaciados) — reordenar el array cambia quién va en cada anillo.
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
  },
  {
    id: "apple",
    label: "APPLE",
    logo: "/logos/apple-mark-white.svg",
    symbol: "AAPL",
  },
  {
    id: "x",
    label: "X",
    logo: "/logos/x-mark-white.svg",
    symbol: "X",
  },
  {
    id: "spacex",
    label: "SPACEX",
    logo: "/logos/spacex-mark-white.svg",
    symbol: "SPCX",
  },
  {
    id: "google",
    label: "GOOGLE",
    logo: "/logos/google-mark-white.svg",
    symbol: "GOOG",
  },
  {
    id: "amazon",
    label: "AMAZON",
    logo: "/logos/amazon-mark-orange.svg",
    symbol: "AMZN",
  },
  {
    id: "nvidia",
    label: "NVIDIA",
    logo: "/logos/nvidia-mark-green.svg",
    symbol: "NVDA",
  },
];
