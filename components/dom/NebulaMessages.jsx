"use client";

import { useEffect, useRef } from "react";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { useChapterIndex } from "@/lib/scroll/useChapter";
import styles from "./NebulaMessages.module.css";

const NEBULA_CHAPTER = 2;

// Mensajes cortos de "chat" ambiental — insinúan un futuro social-fi para
// NFTs (sin funcionalidad real detrás, es solo ambientación de este
// capítulo), mismo diseño holograma técnico que el resto del HUD
// (MicroHud.jsx). A propósito sin cifras/montos ni afirmaciones verificables
// (nada de "MINT DETECTED" tipo señal de actividad real): son jerga de
// comunidad ficticia, coherente con las reglas de cumplimiento del proyecto
// (nunca dato financiero, nunca "Illustrative data" necesario aquí porque no
// hay ninguna cifra que etiquetar). Los datos financieros reales (con su
// etiqueta) viven en components/archive/act-ii-nffc — ver
// docs/ARCHIVED_NFFC_ACT.md.
const MESSAGES = [
  { id: "m1", text: "to the moon!", top: "22%", left: "12%", delay: 0 },
  { id: "m2", text: "zero fud today", top: "68%", left: "18%", delay: 0.08 },
  { id: "m3", text: "loool", top: "30%", left: "78%", delay: 0.16 },
  { id: "m4", text: "farming aura", top: "72%", left: "74%", delay: 0.24 },
];

export default function NebulaMessages() {
  const chapterIndex = useChapterIndex();
  const refs = useRef([]);

  useEffect(() => {
    if (chapterIndex !== NEBULA_CHAPTER) return undefined;
    let rafId;
    const tick = () => {
      const { chapterIndex: idx, chapterProgress } = scrollStore.getState();
      const p3 = getActProgress(idx, chapterProgress, NEBULA_CHAPTER);
      MESSAGES.forEach((msg, i) => {
        const el = refs.current[i];
        if (!el) return;
        const local = p3 - 0.34 - msg.delay;
        const fadeIn = Math.min(Math.max(local / 0.12, 0), 1);
        const fadeOut = 1 - Math.min(Math.max((local - 0.3) / 0.14, 0), 1);
        el.style.opacity = (fadeIn * fadeOut).toFixed(3);
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [chapterIndex]);

  if (chapterIndex !== NEBULA_CHAPTER) return null;

  return (
    <div className={styles.layer}>
      {MESSAGES.map((msg, i) => (
        <div
          key={msg.id}
          ref={(el) => (refs.current[i] = el)}
          className={styles.bubble}
          style={{ top: msg.top, left: msg.left }}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}
