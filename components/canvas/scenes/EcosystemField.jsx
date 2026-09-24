"use client";

import { useMemo } from "react";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { ECOSYSTEM_SCENE } from "@/lib/tuning";
import { createGalaxyAttributes } from "@/lib/shaders/galaxyAttributes";
import Galaxy from "./Galaxy";

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

// Corrección de composición de "The Galaxies & Chains": dos galaxias
// procedurales completas (mismo Galaxy.jsx/GalaxyMaterial que ya usa el LOD
// de "the-universe" — nunca un sistema nuevo), una por cúmulo, diferenciadas
// por tono (ECOSYSTEM_SCENE.companies/chains.colorMix) — nunca un color
// nuevo fuera de la paleta. Los iconos y sus conectores HUD (DOM/SVG, ver
// components/dom/EcosystemNodes.jsx) se anclan a estos mismos centros/núcleos.
const attrsCompanies = createGalaxyAttributes(ECOSYSTEM_SCENE.particleCount, {
  armCount: ECOSYSTEM_SCENE.companies.armCount,
  colorMixCenter: ECOSYSTEM_SCENE.companies.colorMix,
  sizeRange: ECOSYSTEM_SCENE.sizeRange,
});
const attrsChains = createGalaxyAttributes(ECOSYSTEM_SCENE.particleCount, {
  armCount: ECOSYSTEM_SCENE.chains.armCount,
  colorMixCenter: ECOSYSTEM_SCENE.chains.colorMix,
  sizeRange: ECOSYSTEM_SCENE.sizeRange,
});

export default function EcosystemField() {
  const configs = useMemo(
    () => [
      { key: "companies", config: ECOSYSTEM_SCENE.companies, attrs: attrsCompanies },
      { key: "chains", config: ECOSYSTEM_SCENE.chains, attrs: attrsChains },
    ],
    []
  );

  const getProgress = () => {
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const p4 = getActProgress(chapterIndex, chapterProgress, 3);
    return clamp01(p4 / ECOSYSTEM_SCENE.revealDuration);
  };
  // Se apaga al entrar en "the-universe" (acto 5) — igual que el resto de
  // este capítulo, para no quedarse pegado en pantalla para siempre.
  const getOpacity = () => {
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    if (chapterIndex === 4) {
      const p5 = getActProgress(chapterIndex, chapterProgress, 4);
      return 1 - clamp01(p5 / 0.3);
    }
    if (chapterIndex > 4) return 0;
    return 1;
  };

  return (
    <>
      {configs.map(({ key, config, attrs }) => (
        <Galaxy key={key} config={config} attrs={attrs} getProgress={getProgress} getOpacity={getOpacity} />
      ))}
    </>
  );
}
