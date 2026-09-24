"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { useChapterIndex } from "@/lib/scroll/useChapter";
import { UNIVERSE_ENDING } from "@/lib/tuning";
import styles from "./FinalCta.module.css";

// Restructuración a 5 capítulos: antes vivía en su propio capítulo "final"
// (archivado junto al resto del Acto II — ver docs/ARCHIVED_NFFC_ACT.md).
// Ahora es el cierre del propio "the-universe" (05), retriggered dentro de
// SU progreso en vez de al entrar en un capítulo dedicado — mismo
// componente, sin cambios de contenido (wordmark, tagline, CTA funcional).
const UNIVERSE_ENDING_CHAPTER = 4;

// El wordmark y el CTA no viven en ChapterLettering (ese sistema solo sabe
// renderizar texto) porque el CTA tiene que ser un elemento real, enfocable
// e interactivo — no un <div> con estilo. Entra tarde dentro del autoplay
// del capítulo, justo tras el destello de convergencia (UNIVERSE_ENDING.
// ctaRevealAt), y ya no vuelve a apagarse: es el final real de la pieza.
//
// `revealed` (no solo opacity por rAF) es necesario porque el CTA es un
// <Link> real: sin desmontarlo del DOM mientras opacity es 0, seguiría
// siendo focusable/clicable por teclado durante toda la primera mitad del
// capítulo, antes de que el usuario lo vea — mismo criterio de "solo
// setState cuando la fase cambia" que ya usa NffcIdentityCard.jsx.
export default function FinalCta() {
  const chapterIndex = useChapterIndex();
  const wrapperRef = useRef(null);
  const revealedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (chapterIndex !== UNIVERSE_ENDING_CHAPTER) {
      revealedRef.current = false;
      setRevealed(false);
      return undefined;
    }
    let rafId;
    const tick = () => {
      const { chapterIndex: idx, chapterProgress } = scrollStore.getState();
      const p = getActProgress(idx, chapterProgress, UNIVERSE_ENDING_CHAPTER);
      const fade = Math.min(Math.max((p - UNIVERSE_ENDING.ctaRevealAt) / (1 - UNIVERSE_ENDING.ctaRevealAt), 0), 1);
      if (wrapperRef.current) wrapperRef.current.style.opacity = fade.toFixed(3);
      const shouldReveal = fade > 0.02;
      if (shouldReveal !== revealedRef.current) {
        revealedRef.current = shouldReveal;
        setRevealed(shouldReveal);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [chapterIndex]);

  if (chapterIndex !== UNIVERSE_ENDING_CHAPTER || !revealed) return null;

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <img src="/logo-somewhere-finance.png" alt="somewhere.finance" className={styles.logo} />
      <p className={styles.tagline}>Across every chains, trought all the worlds.</p>
      <Link href="/explore" className={styles.cta}>
        Launch Somewhere
      </Link>
    </div>
  );
}
