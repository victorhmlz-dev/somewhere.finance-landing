// Datos mock de las colecciones-galaxia del capítulo 04 (The Galaxies &
// Chains). Cada colección es una variante de la misma galaxia procedural
// (ver components/canvas/scenes/Galaxy.jsx), nunca un círculo con estrellas
// — y ahora, además, lleva una imagen de portada propia (`image`) que flota
// junto a la galaxia como una tarjeta (ver CollectionImage.jsx): la galaxia
// procedural no se sustituye, la imagen la acompaña.
// Etiqueta "Illustrative data" en cualquier UI que muestre estos nombres.
// Radios y offsets a la misma escala que GALAXY_MORPH (lib/tuning.js): a las
// distancias de cámara del acto 4 (z ~36-90), una galaxia de radio 2-3 no se
// lee — hace falta esta escala para que compitan visualmente con la principal.
//
// `image`: ruta a un archivo real en public/collections/ (no generado por
// código) — ver public/collections/README.md para el formato/tamaño
// esperado y el archivo exacto que falta por cada colección. Mientras el
// archivo no exista, CollectionImage.jsx simplemente no renderiza nada (la
// galaxia sigue mostrándose igual) — no hace falta tocar código cuando
// llegue la imagen real, solo colocar el archivo en esa ruta.
export const COLLECTIONS = [
  {
    id: "col-dense",
    name: "Dense Cluster #014",
    variant: "dense",
    armCount: 5,
    tightness: 3.6,
    radius: 9,
    thickness: 0.16,
    noiseAmount: 0.07,
    rotationSpeed: 0.09,
    coreSize: 0.2,
    colorMix: 0.15, // hacia blanco/primary
    position: [-26, 4, -14],
    image: "/collections/col-dense.jpg",
  },
  {
    id: "col-small",
    name: "Fragment Set #392",
    variant: "small",
    armCount: 3,
    tightness: 2.6,
    radius: 5,
    thickness: 0.14,
    noiseAmount: 0.1,
    rotationSpeed: 0.14,
    coreSize: 0.28,
    colorMix: 0.5,
    position: [24, -6, -20],
    image: "/collections/col-small.jpg",
  },
  {
    id: "col-large",
    name: "Vast Archive #007",
    variant: "large",
    armCount: 4,
    tightness: 4.4,
    radius: 13,
    thickness: 0.18,
    noiseAmount: 0.06,
    rotationSpeed: 0.05,
    coreSize: 0.16,
    colorMix: 0.35,
    position: [10, 10, -34],
    image: "/collections/col-large.jpg",
  },
  {
    id: "col-luminous",
    name: "Bright Index #101",
    variant: "luminous",
    armCount: 2,
    tightness: 3.0,
    radius: 7,
    thickness: 0.1,
    noiseAmount: 0.05,
    rotationSpeed: 0.11,
    coreSize: 0.36,
    colorMix: 0.05, // casi blanco puro
    position: [-18, -11, -26],
    image: "/collections/col-luminous.jpg",
  },
  {
    id: "col-chaotic",
    name: "Entropy Field #558",
    variant: "chaotic",
    armCount: 6,
    tightness: 1.8,
    radius: 8,
    thickness: 0.3,
    noiseAmount: 0.22,
    rotationSpeed: 0.08,
    coreSize: 0.2,
    colorMix: 0.7, // hacia accent
    position: [30, 8, -30],
    image: "/collections/col-chaotic.jpg",
  },
  {
    id: "col-geometric",
    name: "Grid Protocol #220",
    variant: "geometric",
    armCount: 8,
    tightness: 5.2,
    radius: 8.5,
    thickness: 0.05,
    noiseAmount: 0.02,
    rotationSpeed: 0.06,
    coreSize: 0.14,
    colorMix: 0.4,
    position: [-10, -4, -42],
    image: "/collections/col-geometric.jpg",
  },
];
