"use client";

import { useChapterNavigation } from "./useChapterNavigation";
import { useChapterIndex } from "./useChapter";
import { chapterRegistry } from "./chapterRegistry";

const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

// Única re-renderización DOM que dispara este archivo: cuando cambia
// chapterIndex (useChapterIndex ya está recortado a eso), para anunciar el
// capítulo a lectores de pantalla. El resto de la navegación (gestos,
// autoplay) vive fuera de React en useChapterNavigation.
export default function ChapterNavigation() {
  useChapterNavigation();
  const chapterIndex = useChapterIndex();
  const chapter = chapterRegistry[chapterIndex];

  return (
    <div aria-live="polite" role="status" style={visuallyHidden}>
      {`Chapter ${chapter.index + 1} of ${chapterRegistry.length}: ${chapter.slug.replace(/-/g, " ")}`}
    </div>
  );
}
