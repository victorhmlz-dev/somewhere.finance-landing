"use client";

import { useEffect, useRef } from "react";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { projectToScreen } from "@/lib/scroll/cameraBridge";
import { CHAINS } from "@/data/chains";
import styles from "./ChainLabels.module.css";

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

// Proyección manual escrita en el DOM por rAF: nada de esto pasa por estado
// de React. Ronda de revisión creativa del Acto I, punto 7: antes cada chain
// tenía un "foco" secuencial (una ventana de scroll en la que solo su
// etiqueta se leía, simulando un recorrido de una en una). Con las siete
// chains mostradas de forma PERMANENTE y con el mismo peso visual — ya no
// hay un capítulo propio para "recorrerlas" — las etiquetas ahora entran
// todas juntas, al mismo ritmo, en el primer tramo del capítulo fusionado
// Galaxies+Chains (acto 3). Ninguna entra antes que las demás.
//
// Se apagan de nuevo durante el acto 4 (the-universe, mientras ChainsField
// también se desvanece — ver Experience.jsx showChains): sin este fade-out
// las siete etiquetas se quedarían pegadas en pantalla para siempre (el
// progreso del acto 3 satura en 1 en todos los capítulos posteriores), y en
// concreto se amontonarían ilegibles sobre el punto central en el capítulo
// One Universe, donde las siete chains vuelven a aparecer muy juntas en una
// vista mucho más alejada.
export default function ChainLabels() {
  const refs = useRef([]);

  useEffect(() => {
    let rafId;
    const tick = () => {
      const { chapterIndex, chapterProgress } = scrollStore.getState();
      const p4 = getActProgress(chapterIndex, chapterProgress, 3);
      const fadeIn = clamp01(p4 / 0.3);
      let fadeOut = 1;
      if (chapterIndex === 4) {
        const p5 = getActProgress(chapterIndex, chapterProgress, 4);
        fadeOut = 1 - clamp01(p5 / 0.3);
      } else if (chapterIndex > 4) {
        fadeOut = 0;
      }
      const reveal = fadeIn * fadeOut;
      const width = window.innerWidth;
      const height = window.innerHeight;

      CHAINS.forEach((chain, i) => {
        const el = refs.current[i];
        if (!el) return;

        const screen = projectToScreen(chain.position, width, height);
        if (!screen || reveal <= 0.01) {
          el.style.opacity = "0";
          return;
        }
        el.style.left = `${screen.x}px`;
        el.style.top = `${screen.y}px`;
        el.style.opacity = reveal.toFixed(3);
      });

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className={styles.layer}>
      {CHAINS.map((chain, i) => (
        <div key={chain.id} ref={(el) => (refs.current[i] = el)} className={styles.anchor}>
          {chain.logo && (
            <span className={styles.iconBadge}>
              <img src={chain.logo} alt="" aria-hidden="true" className={styles.icon} />
            </span>
          )}
          <span className={styles.label}>{chain.label}</span>
        </div>
      ))}
    </div>
  );
}
