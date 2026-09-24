"use client";

import { useEffect, useRef } from "react";
import { useChapterIndex } from "@/lib/scroll/useChapter";
import styles from "./MicroHud.module.css";

function pseudoHash() {
  return Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .toUpperCase()
    .padStart(8, "0");
}

function pseudoCoord() {
  return (Math.random() * 2 - 1).toFixed(3);
}

// Micro-HUD del capítulo 1: coordenadas/hash que cambian, refuerzan la
// sensación de señal/telemetría durante la tensión de la Singularity.
// Contenido escrito directo al DOM en un intervalo, sin estado de React.
export default function MicroHud() {
  const chapterIndex = useChapterIndex();
  const coordRef = useRef(null);
  const hashRef = useRef(null);

  useEffect(() => {
    if (chapterIndex !== 0) return undefined;
    const tick = () => {
      if (coordRef.current) {
        coordRef.current.textContent = `${pseudoCoord()}, ${pseudoCoord()}, ${pseudoCoord()}`;
      }
      if (hashRef.current) {
        hashRef.current.textContent = pseudoHash();
      }
    };
    tick();
    const id = setInterval(tick, 220);
    return () => clearInterval(id);
  }, [chapterIndex]);

  return (
    <div className={styles.hud} style={{ opacity: chapterIndex === 0 ? 1 : 0 }}>
      <div>
        COORD<span ref={coordRef} className={styles.value}>
          0.000, 0.000, 0.000
        </span>
      </div>
      <div>
        HASH<span ref={hashRef} className={styles.value}>
          00000000
        </span>
      </div>
    </div>
  );
}
