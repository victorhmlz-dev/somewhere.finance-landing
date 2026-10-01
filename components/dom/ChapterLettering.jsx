"use client";

import { useEffect, useRef } from "react";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { LETTERING } from "@/lib/tuning";
import styles from "./ChapterLettering.module.css";

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const smoothstep = (t) => t * t * (3 - 2 * t);

// Fija los cortes de línea de una frase tal como quedan con el espaciado
// FINAL: mide dónde parte el navegador cada línea y vuelve a pintar el
// texto como una línea por <span> sin salto interno (white-space: nowrap).
// Sin esto, al animar letter-spacing durante la entrada el texto se
// recolocaba en cada frame y alguna palabra saltaba de una línea a otra al
// terminar (p. ej. "…takes / real form." → "…takes real / form.").
function lockLines(phraseEl, visualEl, text) {
  const prevSpacing = phraseEl.style.letterSpacing;
  phraseEl.style.letterSpacing = `${LETTERING.settledLetterSpacingEm}em`;

  visualEl.replaceChildren();
  const words = text.split(" ").map((word, i) => {
    if (i > 0) visualEl.append(" ");
    const span = document.createElement("span");
    span.textContent = word;
    visualEl.append(span);
    return span;
  });

  const lines = [];
  let lastTop = null;
  words.forEach((span) => {
    const top = Math.round(span.getBoundingClientRect().top);
    if (lastTop === null || Math.abs(top - lastTop) > 4) {
      lines.push([]);
      lastTop = top;
    }
    lines[lines.length - 1].push(span.textContent);
  });

  visualEl.replaceChildren(
    ...lines.map((lineWords) => {
      const line = document.createElement("span");
      line.className = styles.line;
      line.textContent = lineWords.join(" ");
      return line;
    })
  );
  phraseEl.style.letterSpacing = prevSpacing;
}

// Lettering de los capítulos 01-05: todo ligado al progreso del capítulo,
// nunca a una animación autónoma. Un único rAF recorre las frases y escribe
// opacity/transform/letterSpacing directo al DOM — cero estado de React por
// frame. El texto completo vive siempre en el DOM para lectores de pantalla
// (span srOnly); la versión visual, con los cortes de línea fijados
// (lockLines), es aria-hidden.
export default function ChapterLettering() {
  const refs = useRef([]);
  const visualRefs = useRef([]);
  const reducedMotion = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = media.matches;
    const onChange = (e) => {
      reducedMotion.current = e.matches;
    };
    media.addEventListener("change", onChange);

    // Cortes de línea: al montar, cuando carga la fuente (con display: swap
    // la primera medida puede hacerse con la de respaldo) y al redimensionar.
    const relayout = () => {
      LETTERING.phrases.forEach((phrase, i) => {
        const el = refs.current[i];
        const visual = visualRefs.current[i];
        if (el && visual && phrase.text) lockLines(el, visual, phrase.text);
      });
    };
    relayout();
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) relayout();
    });
    let resizeRaf;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(relayout);
    };
    window.addEventListener("resize", onResize);

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
        // Curvas suaves en vez de lineales: la entrada ya no arranca ni
        // frena en seco.
        const opacity = smoothstep(enter) * (1 - smoothstep(exit));

        el.style.opacity = opacity.toFixed(3);

        if (reducedMotion.current) {
          el.style.transform = "translate(-50%, 0)";
          el.style.letterSpacing = `${LETTERING.settledLetterSpacingEm}em`;
        } else {
          const settle = 1 - easeOutCubic(enter);
          const offset = settle * LETTERING.entryOffsetPx;
          const spacing =
            LETTERING.settledLetterSpacingEm +
            settle * (LETTERING.entryLetterSpacingEm - LETTERING.settledLetterSpacingEm);
          el.style.transform = `translate(-50%, ${offset.toFixed(2)}px)`;
          el.style.letterSpacing = `${spacing.toFixed(4)}em`;
        }
      });

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", onResize);
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
              <h2 className={styles.heading}>
                <span className={styles.srOnly}>{phrase.text}</span>
                {/* Rellenado por lockLines (efecto): React no le pone hijos,
                    así que nunca reconcilia sobre el DOM que escribe él. */}
                <span aria-hidden="true" ref={(el) => (visualRefs.current[i] = el)} />
              </h2>
              {phrase.subtext && <p className={styles.subtext}>{phrase.subtext}</p>}
            </>
          ) : (
            // Sin frase: el kicker se promueve a <h2> — sigue siendo el
            // contenido semántico de este tramo, solo que discreto.
            <h2 className={styles.kickerHeading}>{phrase.kicker}</h2>
          )}
        </div>
      ))}
    </div>
  );
}
