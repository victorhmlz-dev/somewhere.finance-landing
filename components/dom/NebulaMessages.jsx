"use client";

import { useEffect, useRef } from "react";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { useChapterIndex } from "@/lib/scroll/useChapter";
import { NEBULA_MESSAGES } from "@/data/nebulaMessages";
import styles from "./NebulaMessages.module.css";

const NEBULA_CHAPTER = 2;
const FADE_IN = 0.12; // progreso del capítulo que tarda en aparecer cada burbuja
const FADE_OUT = 0.14; // ídem para apagarse (las no persistentes)
// Las persistentes se apagan al entrar en el capítulo siguiente, en este
// tramo de su progreso — mismo relevo que el lettering (ver LETTERING en
// lib/tuning.js).
const EXIT_NEXT_CHAPTER = 0.06;

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

// Mensajes cortos de "chat" ambiental de la Nebula (datos y copy en
// data/nebulaMessages.js), mismo diseño holograma técnico que el resto del
// HUD (MicroHud.jsx). Montado durante la Nebula y el arranque del capítulo
// siguiente, para que las burbujas persistentes se apaguen con suavidad en
// vez de desaparecer de golpe al cambiar de escena.
export default function NebulaMessages() {
  const chapterIndex = useChapterIndex();
  const refs = useRef([]);
  const mounted = chapterIndex === NEBULA_CHAPTER || chapterIndex === NEBULA_CHAPTER + 1;

  useEffect(() => {
    if (!mounted) return undefined;
    let rafId;
    const tick = () => {
      const { chapterIndex: idx, chapterProgress } = scrollStore.getState();
      const p3 = getActProgress(idx, chapterProgress, NEBULA_CHAPTER);
      const pNext = getActProgress(idx, chapterProgress, NEBULA_CHAPTER + 1);
      const chapterExit = 1 - clamp01(pNext / EXIT_NEXT_CHAPTER);

      NEBULA_MESSAGES.forEach((msg, i) => {
        const el = refs.current[i];
        if (!el) return;
        const local = p3 - msg.appearAt;
        const fadeIn = clamp01(local / FADE_IN);
        const fadeOut = msg.persist ? 1 : 1 - clamp01((local - FADE_IN - msg.holdFor) / FADE_OUT);
        el.style.opacity = (fadeIn * fadeOut * chapterExit).toFixed(3);
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className={styles.layer}>
      {NEBULA_MESSAGES.map((msg, i) => (
        <div
          key={msg.id}
          ref={(el) => (refs.current[i] = el)}
          className={styles.bubble}
          // Deriva desfasada por burbuja: que no floten todas al unísono.
          style={{ top: msg.top, left: msg.left, animationDelay: `${-i * 0.7}s` }}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}
