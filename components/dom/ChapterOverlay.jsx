"use client";

import { useEffect, useRef } from "react";
import { chapterRegistry } from "@/lib/scroll/chapterRegistry";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { useChapterIndex } from "@/lib/scroll/useChapter";
import styles from "./ChapterOverlay.module.css";

// HUD técnico temporal de la Fase 2 para validar el motor de scroll.
// React solo re-renderiza al cambiar de capítulo (useChapterIndex); el
// progreso local se escribe directamente en el DOM cada frame, sin pasar
// por estado de React.
export default function ChapterOverlay() {
  const chapterIndex = useChapterIndex();
  const progressRef = useRef(null);

  useEffect(() => {
    let rafId;
    const tick = () => {
      const { chapterProgress } = scrollStore.getState();
      if (progressRef.current) {
        progressRef.current.textContent = chapterProgress.toFixed(2);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const chapter = chapterRegistry[chapterIndex];

  return (
    <div className={styles.overlay}>
      <span className={styles.chapter}>
        {String(chapter.index + 1).padStart(2, "0")} / {chapterRegistry.length}{" "}
        — {chapter.slug}
      </span>
      <br />
      <span>p = </span>
      <span ref={progressRef} className={styles.progress}>
        0.00
      </span>
    </div>
  );
}
