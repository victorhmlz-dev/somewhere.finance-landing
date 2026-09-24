import { CHAPTER_DURATIONS } from "@/lib/tuning";

// 5 capítulos activos (antes 13: la restructuración archivó "nffc" en
// adelante — ver docs/ARCHIVED_NFFC_ACT.md). El recorrido activo termina en
// "the-universe", que ahora incluye su propio cierre (convergencia +
// wordmark + CTA, ver docs/SCROLLYTELLING_BRIEF.md). Con el snap por
// capítulo ya no hay tramos de scroll que calcular (start/end/vh) — cada
// capítulo es una parada discreta con una duración de autoplay
// (CHAPTER_DURATIONS, en segundos).
const CHAPTERS = [
  "the-singularity",
  "the-big-bang",
  "the-nebula",
  "the-galaxies-and-chains",
  "the-universe",
];

export const chapterRegistry = CHAPTERS.map((slug, index) => ({
  index,
  slug,
  duration: CHAPTER_DURATIONS[index],
}));
