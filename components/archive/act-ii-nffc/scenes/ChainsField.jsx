"use client";

import { useMemo } from "react";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { CHAINS_SCENE } from "@/lib/tuning";
import { CHAINS } from "@/data/chains";
import { createGalaxyAttributes } from "@/lib/shaders/galaxyAttributes";
import Galaxy from "./Galaxy";

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

const attrsByChain = CHAINS.map((c) =>
  createGalaxyAttributes(CHAINS_SCENE.particleCount, {
    armCount: c.armCount,
    colorMixCenter: c.colorMix,
    sizeRange: CHAINS_SCENE.sizeRange,
  })
);

// Ronda de revisión creativa del Acto I, punto 7: Galaxies y Chains se
// fusionan en un único capítulo (acto 3). Las siete chains (antes cuatro, en
// su propio capítulo) se muestran TODAS de forma permanente, con el mismo
// peso visual, desde el principio de este capítulo fusionado — ya no hay un
// "recorrido" secuencial de una chain a la vez (eso vivía en el ChainLabels
// de antes; ver ese archivo para el porqué del cambio). getProgress ata la
// revelación directamente al acto 3 (antes ataba a un acto "chains" propio,
// el 4, que ya no existe).
const ONE_UNIVERSE_CHAPTER = 11;

export default function ChainsField() {
  const items = useMemo(() => CHAINS.map((config, i) => ({ config, attrs: attrsByChain[i] })), []);

  const getProgress = () => {
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const p4 = getActProgress(chapterIndex, chapterProgress, 3);
    return clamp01(p4 / 0.25);
  };
  // Reaparece en el acto 12 (One Universe): fuera de ese remontaje, opacidad
  // normal (1) — el revelado real ya lo decide getProgress arriba.
  const getOpacity = () => {
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    if (chapterIndex === ONE_UNIVERSE_CHAPTER) {
      return getActProgress(chapterIndex, chapterProgress, ONE_UNIVERSE_CHAPTER);
    }
    return 1;
  };

  return (
    <>
      {items.map(({ config, attrs }) => (
        <Galaxy key={config.id} config={config} attrs={attrs} getProgress={getProgress} getOpacity={getOpacity} />
      ))}
    </>
  );
}
