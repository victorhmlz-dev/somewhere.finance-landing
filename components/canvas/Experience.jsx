"use client";

import { Canvas } from "@react-three/fiber";
import CameraRig from "./CameraRig";
import SceneBackground from "./SceneBackground";
import UniverseParticles from "./scenes/UniverseParticles";
import Shockwave from "./scenes/Shockwave";
import Flash from "./scenes/Flash";
import LensStreak from "./scenes/LensStreak";
import Fragments from "./scenes/Fragments";
import Trails from "./scenes/Trails";
import CoinBurst from "./scenes/CoinBurst";
import WarpStreaks from "./scenes/WarpStreaks";
import NftEmergence from "./scenes/NftEmergence";
import DigitalGrid from "./scenes/DigitalGrid";
import EcosystemField from "./scenes/EcosystemField";
import UniverseField from "./scenes/UniverseField";
import PostFX from "./PostFX";
import styles from "./Experience.module.css";
import { isMobile, CINEMATIC, BIGBANG } from "@/lib/tuning";
import { useChapterIndex } from "@/lib/scroll/useChapter";

// El panel de ajuste en vivo (DevTuning.jsx, leva) se dejó de montar aquí a
// petición explícita — quedaba visible tapando la escena. El archivo sigue
// intacto (no se borró) por si se quiere reactivar más adelante: basta con
// volver a importarlo con next/dynamic (ssr:false) y renderizarlo, como
// antes.
//
// Restructuración a 5 capítulos: "nffc" en adelante se archivó (ver
// docs/ARCHIVED_NFFC_ACT.md — el árbol de montaje de 13 capítulos que existía
// aquí vive como referencia en
// components/archive/act-ii-nffc/Experience.13ch.snapshot.jsx).
export default function Experience() {
  // Montaje condicionado por capítulo: son sistemas pesados que solo hacen
  // falta cerca de su acto. useChapterIndex() solo re-renderiza al cambiar
  // de capítulo (no por frame), así que esto no rompe la regla de "sin
  // estado de React por frame" — es exactamente el mismo hook que ya usa
  // ChapterOverlay.
  const chapterIndex = useChapterIndex();
  const showBigBangFX = chapterIndex <= 2;
  // El streak anamórfico se reutiliza en el pico del cierre de "the-universe"
  // (acto 4, ver lib/scroll/peakMoments.js) — se mantiene montado hasta ahí.
  const showLensStreak = chapterIndex <= 2 || chapterIndex === 4;
  // Las dos galaxias-cúmulo de "The Galaxies & Chains": precalentadas un
  // capítulo antes (desde la Nebula) por disciplina — GalaxyMaterial ya está
  // compilado desde antes (lo usa el LOD de UniverseField). Se quedan
  // montadas el resto de la pieza (su propio fade-out las deja invisibles
  // tras el primer tramo de "the-universe"): no hay un capítulo posterior
  // donde desmontarlas. Los conectores/cajas HUD de los iconos ya no viven
  // en el canvas — son DOM/SVG, ver components/dom/EcosystemNodes.jsx.
  const showEcosystem = chapterIndex >= 2;
  // Cap. 03 (Nebula): las "tarjetas" de NFT placeholder emergen a partir de
  // la segunda mitad del capítulo y se apagan al entrar en "The Galaxies &
  // Chains" (04) — meshBasicMaterial estándar, sin riesgo de hitch.
  const showNftEmergence = chapterIndex >= 2 && chapterIndex <= 3;

  return (
    <div className={styles.canvasWrapper}>
      <Canvas
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: 32, position: [0, 0, 14] }}
      >
        <SceneBackground />
        <ambientLight intensity={0.15} color="#5142fc" />
        <directionalLight intensity={0.7} position={[5, 8, 10]} color="#ffffff" />
        <CameraRig />
        <DigitalGrid />
        <UniverseParticles />
        {/* Flash se reutiliza en dos momentos (Big Bang y el cierre de
            "the-universe", ver Flash.jsx) — montado siempre en vez de
            condicionado a un solo grupo: es un único mesh barato
            (esfera + meshBasicMaterial) que ya estaba activo desde el
            capítulo 0. */}
        <Flash />
        {showBigBangFX && (
          <>
            <Shockwave />
            <Fragments />
            <Trails />
            {/* Montado en el mismo grupo que Shockwave/Fragments (ya activo
                desde el capítulo 0): su shader (CoinMaterial) compila a la
                vez que los de sus hermanos, sin coste extra sobre el snap
                00→01 — mismo criterio que ya usaba este grupo. */}
            {BIGBANG.coins.enabled && <CoinBurst />}
            <WarpStreaks />
          </>
        )}
        {CINEMATIC.lensFlare.enabled && showLensStreak && <LensStreak />}
        {showEcosystem && <EcosystemField />}
        <UniverseField />
        {showNftEmergence && <NftEmergence />}
        <PostFX />
      </Canvas>
      <div className={styles.ambientGlow} />
    </div>
  );
}
