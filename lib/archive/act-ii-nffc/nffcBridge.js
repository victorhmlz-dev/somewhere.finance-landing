// Puente mutable (mismo patrón que cameraBridge.js): NffcSystem escribe la
// posición mundial actual de un punto representativo de cada anillo de
// composición cada frame; NffcLabels.jsx la lee en su propio rAF para
// proyectarla a píxeles vía cameraBridge.projectToScreen, sin acoplar el
// DOM al ciclo de render de r3f.
export const nffcBridge = {
  ringAnchors: [], // [{x,y,z}, ...] uno por activo de la composición featured (cap. 08)
  visible: false,
  categoryAnchors: [], // [{x,y,z}, ...] uno por categoría de "your universe" (cap. 12)
  categoryVisible: false,
};
