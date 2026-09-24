// Progreso 0..1 de un "acto" (capítulo) concreto, derivado del capítulo activo
// y su progreso local: 0 antes de empezar, 1 una vez superado, interpolado
// mientras está activo. Evita que cada escena reimplemente el mismo cálculo.
export function getActProgress(chapterIndex, chapterProgress, actIndex) {
  if (chapterIndex < actIndex) return 0;
  if (chapterIndex > actIndex) return 1;
  return chapterProgress;
}
