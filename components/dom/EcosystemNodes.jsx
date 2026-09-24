"use client";

import { useEffect, useRef } from "react";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { projectToScreen } from "@/lib/scroll/cameraBridge";
import { ECOSYSTEM_SCENE } from "@/lib/tuning";
import { CHAINS } from "@/data/chains";
import { COMPANIES } from "@/data/companies";
import styles from "./EcosystemNodes.module.css";

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
// Ángulo dorado: reparte las fases de órbita de forma no periódica entre
// los 7 iconos de cada cúmulo, para que no se vean sincronizadas.
const GOLDEN_ANGLE = 2.399963;

function vecNormalize([x, y, z]) {
  const len = Math.sqrt(x * x + y * y + z * z) || 1;
  return [x / len, y / len, z / len];
}

// Proyección manual por rAF (mismo mecanismo que ya usaba ChainLabels.jsx,
// archivado — ver docs/ARCHIVED_NFFC_ACT.md): los 14 iconos (7 chains + 7
// empresas tokenizadas) se posicionan cada frame vía cameraBridge.
//
// Iteración HUD sci-fi (segunda corrección de esta escena):
// - Cada icono orbita su offset base (data/chains.js/companies.js) en vez de
//   quedarse fijo — radio pequeño, velocidad y fase por icono (ver
//   GOLDEN_ANGLE arriba), congelado con prefers-reduced-motion (el offset
//   base puro, sin oscilación; la caja y la etiqueta se quedan, solo para de
//   moverse).
// - El conector ya no es la línea recta 3D que había antes
//   (components/canvas/scenes/EcosystemConnections.jsx, retirado): ahora es
//   un trazado SVG en espacio de PANTALLA — nodo fijo en el borde de la
//   galaxia (radio de esa galaxia, dirección del offset BASE del icono, SIN
//   la órbita: el ancla no tiembla) + tramo diagonal corto + quiebre en
//   ángulo recto hasta el icono, que sí seguirá la órbita. Un ángulo recto
//   en 3D no se proyecta como ángulo recto en pantalla bajo perspectiva, así
//   que este trazado solo puede construirse ya proyectado, no en el mundo.
// - Cada icono vive en una caja con esquinas tipo bracket (CSS, ver
//   EcosystemNodes.module.css) en vez de un icono suelto.
//
// La tarjeta central "somewhere.finance" es un simple rótulo fijo en pantalla
// (no proyectado por cameraBridge: su sola posición entre los dos cúmulos ya
// transmite el mensaje) — nunca origen de conectores.
export default function EcosystemNodes() {
  const chainRefs = useRef([]);
  const companyRefs = useRef([]);
  const chainPathRefs = useRef([]);
  const chainNodeRefs = useRef([]);
  const companyPathRefs = useRef([]);
  const companyNodeRefs = useRef([]);
  const cardRef = useRef(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = media.matches;
    const onChange = (e) => {
      reducedMotionRef.current = e.matches;
    };
    media.addEventListener("change", onChange);

    const startTime = performance.now();
    let rafId;
    const tick = () => {
      const { chapterIndex, chapterProgress } = scrollStore.getState();
      const p4 = getActProgress(chapterIndex, chapterProgress, 3);
      const fadeIn = clamp01(p4 / ECOSYSTEM_SCENE.revealDuration);
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
      const t = (performance.now() - startTime) / 1000;
      const orbitScale = reducedMotionRef.current ? 0 : ECOSYSTEM_SCENE.orbit.radius;

      const renderGroup = (items, galaxyConfig, iconRefs, pathRefs, nodeRefs) => {
        const basePos = galaxyConfig.position;
        const radius = galaxyConfig.radius;

        items.forEach((item, i) => {
          const el = iconRefs.current[i];
          const pathEl = pathRefs.current[i];
          const nodeEl = nodeRefs.current[i];

          // Órbita: pequeño temblor 3D no planar, fase/velocidad por icono.
          const phase = i * GOLDEN_ANGLE;
          const speedMul = 0.75 + (i % 4) * 0.12;
          const angle = t * ECOSYSTEM_SCENE.orbit.speed * speedMul + phase;
          const orbit = [
            Math.cos(angle) * orbitScale,
            Math.sin(angle) * orbitScale * 0.6,
            Math.sin(angle * 0.8 + phase) * orbitScale * 0.5,
          ];

          const world = [
            basePos[0] + item.offset[0] + orbit[0],
            basePos[1] + item.offset[1] + orbit[1],
            basePos[2] + item.offset[2] + orbit[2],
          ];
          const screen = projectToScreen(world, width, height);

          if (!screen || reveal <= 0.01) {
            if (el) el.style.opacity = "0";
            if (pathEl) pathEl.style.opacity = "0";
            if (nodeEl) nodeEl.style.opacity = "0";
            return;
          }

          if (el) {
            el.style.left = `${screen.x}px`;
            el.style.top = `${screen.y}px`;
            el.style.opacity = reveal.toFixed(3);
          }

          // Ancla del conector: borde de la galaxia en la dirección del
          // offset BASE (sin órbita) — nunca tiembla, solo el icono al otro
          // extremo se mueve.
          const dir = vecNormalize(item.offset);
          const anchorWorld = [
            basePos[0] + dir[0] * radius,
            basePos[1] + dir[1] * radius,
            basePos[2] + dir[2] * radius,
          ];
          const anchorScreen = projectToScreen(anchorWorld, width, height);

          if (pathEl && nodeEl) {
            if (!anchorScreen) {
              pathEl.style.opacity = "0";
              nodeEl.style.opacity = "0";
            } else {
              const dx = screen.x - anchorScreen.x;
              const dy = screen.y - anchorScreen.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const diag = Math.min(ECOSYSTEM_SCENE.connector.diagPx, dist * 0.6);
              const sign = dx >= 0 ? 1 : -1;
              const bendX = anchorScreen.x + sign * diag;
              const bendY = screen.y;
              pathEl.setAttribute(
                "d",
                `M ${anchorScreen.x.toFixed(1)} ${anchorScreen.y.toFixed(1)} L ${bendX.toFixed(1)} ${bendY.toFixed(1)} L ${screen.x.toFixed(1)} ${screen.y.toFixed(1)}`
              );
              pathEl.style.opacity = (reveal * ECOSYSTEM_SCENE.connectorLineOpacity).toFixed(3);
              nodeEl.setAttribute("cx", anchorScreen.x.toFixed(1));
              nodeEl.setAttribute("cy", anchorScreen.y.toFixed(1));
              nodeEl.style.opacity = reveal.toFixed(3);
            }
          }
        });
      };

      renderGroup(CHAINS, ECOSYSTEM_SCENE.chains, chainRefs, chainPathRefs, chainNodeRefs);
      renderGroup(COMPANIES, ECOSYSTEM_SCENE.companies, companyRefs, companyPathRefs, companyNodeRefs);

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

  const renderConnectors = (items, pathRefs, nodeRefs) =>
    items.map((item, i) => (
      <g key={item.id}>
        <path ref={(el) => (pathRefs.current[i] = el)} className={styles.connectorPath} />
        <circle
          ref={(el) => (nodeRefs.current[i] = el)}
          r={ECOSYSTEM_SCENE.connector.nodeRadiusPx}
          className={styles.connectorNode}
        />
      </g>
    ));

  return (
    <div className={styles.layer}>
      <svg className={styles.connectorSvg}>
        {renderConnectors(CHAINS, chainPathRefs, chainNodeRefs)}
        {renderConnectors(COMPANIES, companyPathRefs, companyNodeRefs)}
      </svg>

      {renderIcons(CHAINS, chainRefs)}
      {renderIcons(COMPANIES, companyRefs)}

      <div ref={cardRef} className={styles.centerCard}>
        <img src="/logo-mark.png" alt="somewhere.finance" className={styles.centerMark} />
      </div>
    </div>
  );
}
