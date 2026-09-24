import { getFlashPeak } from "@/components/canvas/scenes/Flash";
import { UNIVERSE_ENDING } from "@/lib/tuning";

// Los dos "picos" cinematográficos de la experiencia activa (Big Bang en el
// acto 2, el destello del cierre de "The Universe" en el acto 5) comparten
// el mismo tratamiento de pipeline — letterbox, streak anamórfico — pero
// cada uno define su propio pico en el tiempo. Centralizado aquí para que
// PostFX/LensStreak/Letterbox no dupliquen "qué capítulo, qué fórmula" cada
// uno a su manera.
//
// Restructuración a 5 capítulos: "Digital DNA" (antes el segundo pico) se
// archivó junto al resto del Acto II — ver docs/ARCHIVED_NFFC_ACT.md. Su
// hueco lo ocupa ahora el destello del cierre de "The Universe" (Flash.jsx
// reutilizado, ver UNIVERSE_ENDING en lib/tuning.js).
const BIG_BANG_CHAPTER = 1;
const UNIVERSE_ENDING_CHAPTER = 4;

export function getCinematicPeak(chapterIndex, chapterProgress) {
  if (chapterIndex === BIG_BANG_CHAPTER) {
    return getFlashPeak(chapterIndex, chapterProgress);
  }
  if (chapterIndex === UNIVERSE_ENDING_CHAPTER) {
    return Math.exp(
      -Math.pow((chapterProgress - UNIVERSE_ENDING.flashPeakAt) / UNIVERSE_ENDING.flashSigma, 2)
    );
  }
  return 0;
}
