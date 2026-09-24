"use client";

import { useEffect, useRef } from "react";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { useChapterIndex } from "@/lib/scroll/useChapter";
import { MARKET } from "@/data/archive/act-ii-nffc/market";
import styles from "./MarketStats.module.css";

// Ronda de revisión creativa del Acto I, punto 7: antes 10 (con 14 capítulos);
// la fusión Galaxies+Chains desplaza -1 todo lo posterior.
const MARKET_MOVES_CHAPTER = 9;

// Panel fijo (no proyectado en 3D, como la ficha del capítulo 09) con las
// señales de actividad del capítulo 11 — datos completamente ficticios,
// ver data/market.js. Entra/sale con el propio capítulo vía opacity escrita
// por rAF directo al DOM, sin estado de React por frame.
export default function MarketStats() {
  const chapterIndex = useChapterIndex();
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (chapterIndex !== MARKET_MOVES_CHAPTER) return undefined;
    let rafId;
    const tick = () => {
      const { chapterIndex: idx, chapterProgress } = scrollStore.getState();
      const p = getActProgress(idx, chapterProgress, MARKET_MOVES_CHAPTER);
      const fade = Math.min(p / 0.12, 1) * Math.min((1 - p) / 0.12 + 1, 1);
      if (wrapperRef.current) wrapperRef.current.style.opacity = fade.toFixed(3);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [chapterIndex]);

  if (chapterIndex !== MARKET_MOVES_CHAPTER) return null;

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt>Volume (24h)</dt>
          <dd>{MARKET.volume24h}</dd>
        </div>
        <div className={styles.stat}>
          <dt>Sales (24h)</dt>
          <dd>{MARKET.sales24h}</dd>
        </div>
        <div className={styles.stat}>
          <dt>Holders</dt>
          <dd>{MARKET.holders}</dd>
        </div>
        <div className={styles.stat}>
          <dt>Floor</dt>
          <dd>{MARKET.floorPrice}</dd>
        </div>
      </dl>
      <p className={styles.disclaimer}>Illustrative data</p>
    </div>
  );
}
