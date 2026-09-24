// Nodo abstracto "REAL WORLD ASSETS" (ronda de revisión creativa del Acto I,
// punto 7): reutiliza el mismo componente procedural que colecciones/chains
// (components/canvas/scenes/Galaxy.jsx) en vez de construir un sistema
// nuevo. Identidad visual DELIBERADAMENTE distinta a una chain — sin icono
// literal de edificio o dinero (CLAUDE.md, sección Contenido y cumplimiento
// exige justo esto): muchos brazos muy apretados, radio pequeño, ruido casi
// nulo, núcleo grande. El resultado se lee como una estructura ordenada y
// "sólida", no como una galaxia orgánica más — comunica la idea sin usar
// ningún símbolo financiero.
export const REAL_WORLD_ASSETS = {
  id: "real-world-assets",
  label: "REAL WORLD ASSETS",
  armCount: 10,
  tightness: 6.5,
  radius: 4,
  thickness: 0.05,
  noiseAmount: 0.015,
  rotationSpeed: 0.05,
  coreSize: 0.5,
  colorMix: 0.05,
  particleScale: 0.9,
  // Y muy por debajo de las chains y de la galaxia hero (radio ~14, ver
  // GALAXY_MORPH.radius): fuera de su nube de partículas, en espacio
  // oscuro despejado, para que se lea como un nodo propio y no se pierda
  // dentro del bloom central. Z positivo: más cerca de cámara que el origen.
  position: [0, -15, 4],
};
