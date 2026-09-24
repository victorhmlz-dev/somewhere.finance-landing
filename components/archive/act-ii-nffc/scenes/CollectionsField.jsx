"use client";

import { useMemo } from "react";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { COLLECTIONS_SCENE } from "@/lib/tuning";
import { COLLECTIONS } from "@/data/archive/act-ii-nffc/collections";
import { createGalaxyAttributes } from "@/lib/shaders/galaxyAttributes";
import Galaxy from "./Galaxy";
import CollectionImage from "./CollectionImage";

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

// Una galaxia satélite por colección (data/collections.js) — la principal
// (la que colapsa desde la nebulosa) vive en UniverseParticles; estas son
// las "varias variantes" adicionales que aparecen según la cámara retrocede.
const attrsByCollection = COLLECTIONS.map((c) =>
  createGalaxyAttributes(COLLECTIONS_SCENE.particleCount, {
    armCount: c.armCount,
    colorMixCenter: c.colorMix,
    sizeRange: COLLECTIONS_SCENE.sizeRange,
  })
);

const ONE_UNIVERSE_CHAPTER = 11;

// Reaparece en el acto 13 (One Universe): fuera de ese remontaje, opacidad
// normal (1) — el revelado real lo decide cada getProgress individual.
const getOpacity = () => {
  const { chapterIndex, chapterProgress } = scrollStore.getState();
  if (chapterIndex === ONE_UNIVERSE_CHAPTER) {
    return getActProgress(chapterIndex, chapterProgress, ONE_UNIVERSE_CHAPTER);
  }
  return 1;
};

export default function CollectionsField() {
  const items = useMemo(
    () => COLLECTIONS.map((config, i) => ({ config, attrs: attrsByCollection[i] })),
    []
  );

  return (
    <>
      {items.map(({ config, attrs }, i) => {
        const revealStart = COLLECTIONS_SCENE.appearStart + i * COLLECTIONS_SCENE.staggerPerGalaxy;
        const revealEnd = Math.min(revealStart + 0.2, COLLECTIONS_SCENE.appearEnd + 0.2);
        const getProgress = () => {
          const { chapterIndex, chapterProgress } = scrollStore.getState();
          const p4 = getActProgress(chapterIndex, chapterProgress, 3);
          return clamp01((p4 - revealStart) / Math.max(revealEnd - revealStart, 0.001));
        };
        return (
          <group key={config.id}>
            <Galaxy config={config} attrs={attrs} getProgress={getProgress} getOpacity={getOpacity} />
            {/* Tarjeta de imagen real (public/collections/) junto a la
                galaxia — no la sustituye, ver CollectionImage.jsx. */}
            <CollectionImage config={config} getProgress={getProgress} getOpacity={getOpacity} />
          </group>
        );
      })}
    </>
  );
}
