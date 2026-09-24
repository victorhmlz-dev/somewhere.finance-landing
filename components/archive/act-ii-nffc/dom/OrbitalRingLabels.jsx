"use client";

import { useEffect, useRef } from "react";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { projectToScreen } from "@/lib/scroll/cameraBridge";
import { nffcBridge } from "@/lib/archive/act-ii-nffc/nffcBridge";
import { NFFC_SYSTEM } from "@/lib/tuning";
import { FEATURED_NFFC } from "@/data/archive/act-ii-nffc/nffc";
import styles from "./OrbitalRingLabels.module.css";

// `variant` es una cadena plana (nunca una función ni el propio bridge)
// porque este componente se monta desde app/page.js, un Server Component:
// las funciones/objetos "vivos" pasados como prop entre el límite
// servidor/cliente se serializan (pierden su referencia compartida) o ni
// siquiera se aceptan. Importando nffcBridge/los datos aquí dentro (ya
// estamos en "use client") se preserva la referencia mutable real que
// NffcSystem.jsx escribe cada frame — mismo motivo por el que
// ChainLabels.jsx importa cameraBridge directamente en vez de recibirlo.
//
// `anchorsKey` (no el array en sí) es a propósito: NffcSystem.jsx
// REASIGNA nffcBridge.ringAnchors/categoryAnchors por completo al cargar su
// módulo (no muta el array existente), así que capturar `nffcBridge.xxx`
// una vez aquí arriba puede quedarse con la referencia vieja si este módulo
// se evalúa antes que el de NffcSystem (Canvas se carga con
// next/dynamic). Leyendo `nffcBridge[anchorsKey]` dentro del propio tick se
// obtiene siempre el array vigente.
// Índices renumerados en la ronda de revisión creativa del Acto I, punto 7
// (fusión Galaxies+Chains desplaza -1 todo lo posterior): composition era 7,
// category era 11.
const VARIANTS = {
  composition: {
    items: FEATURED_NFFC.composition,
    anchorsKey: "ringAnchors",
    getVisible: () => nffcBridge.visible,
    actIndex: 6,
  },
  category: {
    items: NFFC_SYSTEM.yourUniverseCategories,
    anchorsKey: "categoryAnchors",
    getVisible: () => nffcBridge.categoryVisible,
    actIndex: 10,
  },
};

// Etiquetas de anillo genéricas: mismo patrón de proyección por rAF que
// ChainLabels.jsx, pero la posición de anclaje viene de nffcBridge (escrita
// por NffcSystem cada frame) en vez de coordenadas estáticas — los anillos
// rotan y se reconfiguran, así que su posición en pantalla cambia con
// ellos. Reutilizado por el capítulo 08 (composición del NFFC featured) y
// el 12 (categorías de "your universe") con datos distintos pero el mismo
// mecanismo.
export default function OrbitalRingLabels({ variant, showBadge = true }) {
  const { items, anchorsKey, getVisible, actIndex } = VARIANTS[variant];
  const refs = useRef([]);
  const badgeRef = useRef(null);

  useEffect(() => {
    let rafId;
    const tick = () => {
      const { chapterIndex, chapterProgress } = scrollStore.getState();
      const p = getActProgress(chapterIndex, chapterProgress, actIndex);
      const width = window.innerWidth;
      const height = window.innerHeight;
      const active = getVisible();
      const anchors = nffcBridge[anchorsKey];
      // Entra/sale con el propio capítulo: nunca aparece de golpe ni se
      // queda pegado al pasar al siguiente.
      const fade = active ? Math.min(p / 0.1, 1) * Math.min((1 - p) / 0.1 + 1, 1) : 0;

      items.forEach((item, i) => {
        const el = refs.current[i];
        if (!el) return;
        const anchor = anchors[i];
        const screen = anchor && active ? projectToScreen([anchor.x, anchor.y, anchor.z], width, height) : null;
        if (!screen || fade <= 0.01) {
          el.style.opacity = "0";
          return;
        }
        el.style.left = `${screen.x}px`;
        el.style.top = `${screen.y}px`;
        el.style.opacity = fade.toFixed(3);
      });

      if (badgeRef.current) {
        badgeRef.current.style.opacity = active ? fade.toFixed(3) : "0";
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [items, anchorsKey, getVisible, actIndex]);

  return (
    <div className={styles.layer}>
      {items.map((item, i) => (
        <div key={item.asset} ref={(el) => (refs.current[i] = el)} className={styles.anchor}>
          <span className={styles.assetName}>{item.asset}</span>
          {"weight" in item && <span className={styles.assetWeight}>{item.weight}%</span>}
        </div>
      ))}
      {showBadge && (
        <div ref={badgeRef} className={styles.dataBadge}>
          Illustrative data
        </div>
      )}
    </div>
  );
}
