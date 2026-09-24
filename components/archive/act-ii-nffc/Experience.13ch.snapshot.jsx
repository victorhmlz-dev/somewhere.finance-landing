"use client";

import dynamic from "next/dynamic";
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
import CollectionsField from "./scenes/CollectionsField";
import ChainsField from "./scenes/ChainsField";
import RwaNode from "./scenes/RwaNode";
import UniverseField from "./scenes/UniverseField";
import NffcSystem from "./scenes/NffcSystem";
import GalaxyConnections from "./scenes/GalaxyConnections";
import PostFX from "./PostFX";
import styles from "./Experience.module.css";
import { isMobile, CINEMATIC, BIGBANG } from "@/lib/tuning";
import { useChapterIndex } from "@/lib/scroll/useChapter";

// `if (process.env.NODE_ENV !== "production")` es una constante en build
// time: Next elimina esta rama entera (y el import de leva con ella) del
// bundle de producción — DevTuning nunca llega a un `next build` real.
const DevTuning =
  process.env.NODE_ENV !== "production"
    ? dynamic(() => import("./DevTuning"), { ssr: false })
    : null;

// Ronda de revisión creativa del Acto I, punto 7: "the-galaxies" (antes
// índice 3) y "the-chains" (antes índice 4) se fusionan en un único
// capítulo, índice 3 — 13 capítulos en total en vez de 14. Todos los rangos
// de esta función que antes mencionaban un tramo "3 a 4" ahora son solo el
// índice 3, y todo lo posterior al 4 se renumera -1.
export default function Experience() {
  // Montaje condicionado por capítulo: son sistemas pesados que solo hacen
  // falta cerca de su acto. useChapterIndex() solo re-renderiza al cambiar
  // de capítulo (no por frame), así que esto no rompe la regla de "sin
  // estado de React por frame" — es exactamente el mismo hook que ya usa
  // ChapterOverlay.
  const chapterIndex = useChapterIndex();
  const showBigBangFX = chapterIndex <= 2;
  // El streak anamórfico se reutiliza en el pico del capítulo 09 (antes 10,
  // ver lib/scroll/peakMoments.js) — se mantiene montado hasta ahí.
  const showLensStreak = chapterIndex <= 2 || chapterIndex === 8;
  // Montado un capítulo antes de que se necesite (desde Big Bang, no desde
  // Nebula): la primera vez que se monta CollectionsField, three.js compila
  // el programa de GalaxyMaterial por primera vez — un coste síncrono de
  // ~370ms medido con un snap real al entrar en Nebula. Con este adelanto
  // ese coste cae dentro del capítulo Big Bang (progress 0 → invisible por
  // el uniform uProgress, ver GalaxyMaterial.js) en vez de en el snap hacia
  // Nebula, que antes se sentía como un hitch perceptible.
  // Acto 12 (One Universe, antes 13): las mismas colecciones/chains/LOD del
  // universo reaparecen a la vez, sin tocar su lógica interna (solo el
  // multiplicador de opacidad ya extendido en cada componente) — "todas las
  // galaxias a la vez", el mismo peso visual del capítulo fusionado
  // Galaxies+Chains.
  const showOneUniverse = chapterIndex === 11;
  // Antes (1 a 4) || oneUniverse — el capítulo fusionado absorbe lo que
  // antes eran dos capítulos (3 galaxies + 4 chains), así el límite superior
  // baja de 4 a 3.
  const showCollections = (chapterIndex >= 1 && chapterIndex <= 3) || showOneUniverse;
  // ChainsField ahora vive solo dentro del capítulo fusionado (índice 3) y
  // se mantiene un capítulo más (universe, índice 4) mientras se desvanece
  // hacia el fondo — antes cubría 3-5 (galaxies+chains+universe).
  const showChains = (chapterIndex >= 3 && chapterIndex <= 4) || showOneUniverse;
  // Se desvanece a lo largo del capítulo 06 (NFFC, antes 07 — ver
  // UniverseField.jsx) y se desmonta al terminar — sin esto seguiría
  // dibujando "miles de galaxias" (a opacidad 0, pero con coste de draw
  // calls) durante todo el Acto II.
  const showUniverseField = (chapterIndex >= 3 && chapterIndex <= 5) || showOneUniverse;
  // Precalentado desde el capítulo 05 ("the-universe", antes 06), un
  // capítulo antes de su debut real en el 06 (nffc, antes 07): mismo
  // criterio que showCollections arriba — la primera compilación de
  // OrbitalMaterial cae aquí, no en el snap 05→06. Se mantiene montado hasta
  // el 11 (Your Universe, antes 12): reutiliza el mismo sistema orbital para
  // la actividad de mercado (10) y las categorías de cuenta del usuario
  // (11), sin crear un segundo InstancedMesh.
  const showNffc = chapterIndex >= 4 && chapterIndex <= 10;
  // GalaxyConnections usa lineBasicMaterial (three.js estándar), la misma
  // combinación que DigitalGrid ya compiló desde el capítulo 01 — sin
  // riesgo de hitch de shader nuevo. Ronda de revisión creativa del Acto I,
  // punto 7: el mismo componente ahora se monta DOS veces con `variant`
  // distinto (en vez de duplicar el sistema de conectores) — una vez para el
  // capítulo fusionado Galaxies+Chains (cada chain conectada al origen y al
  // nodo "real world assets") y otra para One Universe (bucle chain-a-chain,
  // diseño original) — cada una precalentada un capítulo antes por
  // disciplina.
  const showGalaxiesChainsConnections = chapterIndex >= 2 && chapterIndex <= 3;
  const showOneUniverseConnections = chapterIndex >= 10 && chapterIndex <= 11;
  // Cap. 03 (Nebula): las "tarjetas" de NFT placeholder emergen a partir de
  // la segunda mitad del capítulo y se apagan al entrar en el capítulo
  // fusionado Galaxies+Chains (04, antes "Galaxies" en el 04) — sin cambio
  // numérico: ambos índices (2 y 3) ya eran así antes de la fusión.
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
        {showBigBangFX && (
          <>
            <Shockwave />
            <Flash />
            <Fragments />
            <Trails />
            {/* Montado en el mismo grupo que Shockwave/Flash/Fragments (ya
                activo desde el capítulo 0): su shader (CoinMaterial) compila
                a la vez que los de sus hermanos, sin coste extra sobre el
                snap 00→01 — mismo criterio que ya usaba este grupo. */}
            {BIGBANG.coins.enabled && <CoinBurst />}
            <WarpStreaks />
          </>
        )}
        {CINEMATIC.lensFlare.enabled && showLensStreak && <LensStreak />}
        {showCollections && <CollectionsField />}
        {showChains && <ChainsField />}
        {showChains && <RwaNode />}
        {showUniverseField && <UniverseField />}
        {showNffc && <NffcSystem />}
        {showGalaxiesChainsConnections && <GalaxyConnections variant="galaxiesChains" />}
        {showOneUniverseConnections && <GalaxyConnections variant="oneUniverse" />}
        {showNftEmergence && <NftEmergence />}
        <PostFX />
      </Canvas>
      <div className={styles.ambientGlow} />
      {DevTuning && <DevTuning />}
    </div>
  );
}
