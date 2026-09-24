"use client";

import { useEffect, useRef } from "react";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { LETTERING } from "@/lib/tuning";
import styles from "./ChapterLettering.module.css";

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

// Lettering de los capítulos 01-03: todo ligado al scroll (scrub), nunca a
// una animación autónoma. Un único rAF recorre las 5 frases y escribe
// opacity/transform/letterSpacing directo al DOM — cero estado de React por
// frame. El texto vive siempre en el DOM (accesible a lectores de pantalla
// en orden de lectura); lo que cambia por scroll es solo su presentación
// visual.
export default function ChapterLettering() {
  const refs = useRef([]);
  const reducedMotion = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = media.matches;
    const onChange = (e) => {
      reducedMotion.current = e.matches;
    };
    media.addEventListener("change", onChange);

    let rafId;
    const tick = () => {
      const { chapterIndex, chapterProgress } = scrollStore.getState();

      LETTERING.phrases.forEach((phrase, i) => {
        const el = refs.current[i];
        if (!el) return;

        const enterActIndex = phrase.enterChapter ?? phrase.chapter;
        const exitActIndex = phrase.exitChapter ?? phrase.chapter;
        const enterVal = getActProgress(chapterIndex, chapterProgress, enterActIndex);
        const exitVal = getActProgress(chapterIndex, chapterProgress, exitActIndex);

        const enter = clamp01((enterVal - phrase.enterStart) / (phrase.enterEnd - phrase.enterStart));
        const exit = clamp01((exitVal - phrase.exitStart) / (phrase.exitEnd - phrase.exitStart));
        const opacity = enter * (1 - exit);

        el.style.opacity = opacity.toFixed(3);

        if (reducedMotion.current) {
          el.style.transform = "translate(-50%, 0)";
          el.style.letterSpacing = `${LETTERING.settledLetterSpacingEm}em`;
        } else {
          const offset = (1 - enter) * LETTERING.entryOffsetPx;
          const spacing =
            LETTERING.settledLetterSpacingEm +
            (1 - enter) * (LETTERING.entryLetterSpacingEm - LETTERING.settledLetterSpacingEm);
          el.style.transform = `translate(-50%, ${offset}px)`;
          el.style.letterSpacing = `${spacing}em`;
        }
      });

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      media.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <div className={styles.layer}>
      <div className={styles.scrim} aria-hidden="true" />
      {LETTERING.phrases.map((phrase, i) => (
        <div key={phrase.id} ref={(el) => (refs.current[i] = el)} className={styles.phrase}>
          {phrase.text ? (
            <>
              {phrase.kicker && <p className={styles.kicker}>{phrase.kicker}</p>}
              <h2 className={styles.heading}>{phrase.text}</h2>
              {phrase.subtext && <p className={styles.subtext}>{phrase.subtext}</p>}
            </>
          ) : (
            // Sin frase (cap. 04/05): el kicker se promueve a <h2> — sigue
            // siendo el contenido semántico de este tramo, solo que discreto.
            <h2 className={styles.kickerHeading}>{phrase.kicker}</h2>
          )}
        </div>
      ))}
    </div>
  );
}
