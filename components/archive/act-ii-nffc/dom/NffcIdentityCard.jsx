"use client";

import { useEffect, useRef, useState } from "react";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { useChapterIndex } from "@/lib/scroll/useChapter";
import { NFFC, FEATURED_NFFC } from "@/data/archive/act-ii-nffc/nffc";
import styles from "./NffcIdentityCard.module.css";

// Ronda de revisión creativa del Acto I, punto 7: antes 8 (con 14 capítulos);
// la fusión Galaxies+Chains desplaza -1 todo lo posterior.
const NON_FUNGIBLE_CHAPTER = 7;

// Rolodex breve: dos NFFC no destacados y luego el featured, fijado el
// resto del capítulo — mismos datos ficticios de data/nffc.js. Solo tres
// cambios discretos por reproducción, así que un useState actualizado desde
// un rAF (que SOLO llama a setState cuando la fase cambia, igual que
// useChapterIndex) no rompe la regla de "sin estado de React por frame".
const rolodexSequence = [
  { record: NFFC.find((n) => n.id === "0188"), until: 0.3 },
  { record: NFFC.find((n) => n.id === "0937"), until: 0.55 },
  { record: FEATURED_NFFC, until: 1.01 },
];

function useRolodexRecord() {
  const [record, setRecord] = useState(rolodexSequence[0].record);

  useEffect(() => {
    let rafId;
    let currentPhase = -1;
    const tick = () => {
      const { chapterIndex, chapterProgress } = scrollStore.getState();
      const p9 = getActProgress(chapterIndex, chapterProgress, NON_FUNGIBLE_CHAPTER);
      const phase = rolodexSequence.findIndex((step) => p9 <= step.until);
      const resolvedPhase = phase === -1 ? rolodexSequence.length - 1 : phase;
      if (resolvedPhase !== currentPhase) {
        currentPhase = resolvedPhase;
        setRecord(rolodexSequence[resolvedPhase].record);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return record;
}

// Ficha de identidad del capítulo 09: HTML semántico real (dl/dt/dd), fuera
// del canvas, legible por lectores de pantalla. Datos completamente
// ficticios — ver data/nffc.js.
export default function NffcIdentityCard() {
  const chapterIndex = useChapterIndex();
  const record = useRolodexRecord();

  if (chapterIndex !== NON_FUNGIBLE_CHAPTER) return null;

  return (
    <div className={styles.wrapper}>
      <dl className={styles.card} aria-label={`NFFC identity: ${record.name}`}>
        <div className={styles.row}>
          <dt>Token ID</dt>
          <dd>#{record.id}</dd>
        </div>
        <div className={styles.row}>
          <dt>Collection</dt>
          <dd>{record.collection}</dd>
        </div>
        <div className={styles.row}>
          <dt>Rarity</dt>
          <dd>{record.rarity}</dd>
        </div>
        <div className={styles.row}>
          <dt>Chain</dt>
          <dd>{record.chain}</dd>
        </div>
        <div className={styles.row}>
          <dt>Composition</dt>
          <dd>{record.composition.length} assets</dd>
        </div>
        <div className={styles.row}>
          <dt>Status</dt>
          <dd className={record.status === "ACTIVE" ? styles.statusActive : styles.statusLocked}>
            {record.status}
          </dd>
        </div>
        <div className={styles.row}>
          <dt>Ownership</dt>
          <dd>{record.owner}</dd>
        </div>
        <div className={styles.row}>
          <dt>History</dt>
          <dd>
            <ul className={styles.history}>
              {record.history.map((entry) => (
                <li key={`${record.id}-${entry.date}`}>
                  {entry.date} — {entry.event}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
      <p className={styles.disclaimer}>Illustrative data</p>
    </div>
  );
}
