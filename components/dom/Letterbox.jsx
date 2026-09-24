"use client";

import { useEffect, useRef } from "react";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getCinematicPeak } from "@/lib/scroll/peakMoments";
import { chapterRegistry } from "@/lib/scroll/chapterRegistry";
import { CINEMATIC } from "@/lib/tuning";
import styles from "./Letterbox.module.css";

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

// Barras negras DOM/CSS: nunca roban altura de forma permanente, solo se
// abren en momentos climáticos (pico del Big Bang, reveal de la doble
// hélice en el capítulo 10, acento breve al entrar a cualquier capítulo) y
// se cierran solas. Igual que ChapterOverlay, escriben directamente en el
// DOM vía ref+rAF, sin estado de React por frame.
export default function Letterbox() {
  const topRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    let rafId;
    const { maxHeightVh, snapAccentMs, snapAccentScale } = CINEMATIC.letterbox;

    const tick = () => {
      const { chapterIndex, chapterProgress } = scrollStore.getState();
      const peakAmount = getCinematicPeak(chapterIndex, chapterProgress);

      const durationMs = (chapterRegistry[chapterIndex]?.duration ?? 3) * 1000;
      const elapsedMs = chapterProgress * durationMs;
      const snapAccent = elapsedMs < snapAccentMs ? 1 - elapsedMs / snapAccentMs : 0;

      const amount = clamp01(Math.max(peakAmount, snapAccent * snapAccentScale));
      const height = `${(amount * maxHeightVh).toFixed(2)}vh`;

      if (topRef.current) topRef.current.style.height = height;
      if (bottomRef.current) bottomRef.current.style.height = height;

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <>
      <div ref={topRef} className={`${styles.bar} ${styles.top}`} />
      <div ref={bottomRef} className={`${styles.bar} ${styles.bottom}`} />
    </>
  );
}
