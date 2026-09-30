"use client";

import { useEffect, useRef } from "react";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { projectToScreen, getViewDepth } from "@/lib/scroll/cameraBridge";
import { ECOSYSTEM_SCENE } from "@/lib/tuning";
import {
  getEcosystemReveal,
  getOrbitPoint,
  getOrbitSlot,
  getRingRadius,
} from "@/lib/ecosystemOrbits";
import { CHAINS } from "@/data/chains";
import { COMPANIES } from "@/data/companies";
import styles from "./EcosystemNodes.module.css";

const smoothstep = (a, b, v) => {
  const t = Math.min(Math.max((v - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

// Proyección manual por rAF (mismo mecanismo que ya usaba ChainLabels.jsx,
// archivado — ver docs/ARCHIVED_NFFC_ACT.md): los 14 iconos (7 chains + 7
// empresas tokenizadas) se posicionan cada frame vía cameraBridge.
//
// Órbitas (tercera corrección de esta escena): cada icono recorre uno de
// los anillos de su galaxia (EcosystemOrbits.jsx dibuja los anillos; la
// geometría compartida vive en lib/ecosystemOrbits.js). El reparto entre
// anillos y la fase inicial son automáticos (getOrbitSlot). Los iconos en la
// mitad del anillo que queda detrás del disco se atenúan y encogen
// (ECOSYSTEM_SCENE.orbits.behindOpacity/behindScale) para que la órbita se
// lea en 3D. Con prefers-reduced-motion los anillos no giran: cada icono se
// queda en su posición inicial.
//
// Cada icono vive en una caja con esquinas tipo bracket (CSS, ver
// EcosystemNodes.module.css). La marca central "somewhere.finance" es un
// rótulo fijo en pantalla (no proyectado por cameraBridge: su sola posición
// entre los dos cúmulos ya transmite el mensaje).
export default function EcosystemNodes() {
  const chainRefs = useRef([]);
  const companyRefs = useRef([]);
  const cardRef = useRef(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = media.matches;
    const onChange = (e) => {
      reducedMotionRef.current = e.matches;
    };
    media.addEventListener("change", onChange);

    const { orbits } = ECOSYSTEM_SCENE;
    const world = [0, 0, 0];
    const startTime = performance.now();
    let rafId;
    const tick = () => {
      const { chapterIndex, chapterProgress } = scrollStore.getState();
      const reveal = getEcosystemReveal(chapterIndex, chapterProgress);
      const width = window.innerWidth;
      const height = window.innerHeight;
      const t = reducedMotionRef.current ? 0 : (performance.now() - startTime) / 1000;

      const renderGroup = (items, galaxy, iconRefs) => {
        const centerDepth = getViewDepth(galaxy.position);

        items.forEach((item, i) => {
          const el = iconRefs.current[i];
          if (!el) return;

          const { ring, phase } = getOrbitSlot(i, items.length);
          const radius = getRingRadius(galaxy, ring);
          getOrbitPoint(galaxy, radius, phase + t * orbits.speeds[ring], world);
          const screen = projectToScreen(world, width, height);

          if (!screen || reveal <= 0.01) {
            el.style.opacity = "0";
            return;
          }

          // 0 = mitad delantera del anillo, 1 = mitad trasera (más lejos de
          // la cámara que el centro del disco), con transición suave.
          const behind = smoothstep(-0.25, 0.25, (getViewDepth(world) - centerDepth) / radius);
          const opacity = reveal * (1 - behind * (1 - orbits.behindOpacity));
          const scale = 1 - behind * (1 - orbits.behindScale);

          el.style.left = `${screen.x}px`;
          el.style.top = `${screen.y}px`;
          el.style.opacity = opacity.toFixed(3);
          el.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(3)})`;
          el.style.zIndex = behind > 0.5 ? "0" : "1";
        });
      };

      renderGroup(CHAINS, ECOSYSTEM_SCENE.chains, chainRefs);
      renderGroup(COMPANIES, ECOSYSTEM_SCENE.companies, companyRefs);

      if (cardRef.current) cardRef.current.style.opacity = reveal.toFixed(3);

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      media.removeEventListener("change", onChange);
    };
  }, []);

  const renderIcons = (items, iconRefs) =>
    items.map((item, i) => (
      <div key={item.id} ref={(el) => (iconRefs.current[i] = el)} className={styles.anchor}>
        <div className={styles.hudBox}>
          <span className={`${styles.corner} ${styles.cornerTL}`} />
          <span className={`${styles.corner} ${styles.cornerTR}`} />
          <span className={`${styles.corner} ${styles.cornerBL}`} />
          <span className={`${styles.corner} ${styles.cornerBR}`} />
          {item.logo ? (
            <img src={item.logo} alt={item.label} className={styles.icon} />
          ) : (
            <span className={styles.fallbackSymbol} aria-label={item.label}>
              {item.symbol}
            </span>
          )}
        </div>
        {item.logo && <span className={styles.microLabel}>{item.symbol}</span>}
      </div>
    ));

  return (
    <div className={styles.layer}>
      {renderIcons(CHAINS, chainRefs)}
      {renderIcons(COMPANIES, companyRefs)}

      <div ref={cardRef} className={styles.centerCard}>
        <img src="/logo-mark.png" alt="somewhere.finance" className={styles.centerMark} />
      </div>
    </div>
  );
}
