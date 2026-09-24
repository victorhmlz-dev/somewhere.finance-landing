"use client";

import { useMemo } from "react";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { RWA_SCENE } from "@/lib/tuning";
import { REAL_WORLD_ASSETS } from "@/data/archive/act-ii-nffc/realWorldAssets";
import { createGalaxyAttributes } from "@/lib/shaders/galaxyAttributes";
import Galaxy from "./Galaxy";

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const ONE_UNIVERSE_CHAPTER = 11;

const attrs = createGalaxyAttributes(RWA_SCENE.particleCount, {
  armCount: REAL_WORLD_ASSETS.armCount,
  colorMixCenter: REAL_WORLD_ASSETS.colorMix,
  sizeRange: RWA_SCENE.sizeRange,
});

// Nodo "REAL WORLD ASSETS" del capítulo fusionado Galaxies+Chains — mismo
// componente Galaxy que las chains, montado una sola vez aparte porque su
// revelado y reaparición en One Universe siguen exactamente el mismo ritmo
// que ChainsField.jsx (misma curva, ver ese archivo para el porqué de p4/0.25).
export default function RwaNode() {
  const config = useMemo(() => REAL_WORLD_ASSETS, []);

  const getProgress = () => {
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const p4 = getActProgress(chapterIndex, chapterProgress, 3);
    return clamp01(p4 / 0.25);
  };
  const getOpacity = () => {
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    if (chapterIndex === ONE_UNIVERSE_CHAPTER) {
      return getActProgress(chapterIndex, chapterProgress, ONE_UNIVERSE_CHAPTER);
    }
    return 1;
  };

  return <Galaxy config={config} attrs={attrs} getProgress={getProgress} getOpacity={getOpacity} />;
}
