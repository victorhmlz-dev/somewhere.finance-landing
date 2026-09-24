import { CHAPTER_DURATIONS } from "@/lib/tuning";

// 13 capítulos del brief (antes 14: la ronda de revisión creativa del Acto I,
// punto 7, fusionó "the-galaxies" + "the-chains" en un único capítulo). Con
// el snap por capítulo ya no hay tramos de scroll que calcular
// (start/end/vh) — cada capítulo es una parada discreta con una duración de
// autoplay (CHAPTER_DURATIONS, en segundos).
const CHAPTERS = [
  "the-singularity",
  "the-big-bang",
  "the-nebula",
  "the-galaxies-and-chains",
  "the-universe",
  "nffc",
  "the-index",
  "non-fungible",
  "digital-dna",
  "the-market-moves",
  "your-universe",
  "one-universe",
  "final",
];

export const chapterRegistry = CHAPTERS.map((slug, index) => ({
  index,
  slug,
  duration: CHAPTER_DURATIONS[index],
}));
