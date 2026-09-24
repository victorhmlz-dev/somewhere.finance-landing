"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { useChapterIndex } from "@/lib/scroll/useChapter";
import { NFFC_SYSTEM } from "@/lib/tuning";
import { FEATURED_NFFC } from "@/data/archive/act-ii-nffc/nffc";
import { MARKET } from "@/data/archive/act-ii-nffc/market";
import { buildGalaxyScatterLayout, buildOrbitalLayout, buildHelixLayout, blend3, blend1 } from "@/lib/archive/act-ii-nffc/orbitalLayouts";
import { nffcBridge } from "@/lib/archive/act-ii-nffc/nffcBridge";
import "./OrbitalMaterial";

const COUNT = NFFC_SYSTEM.instanceCount;
const dummy = new THREE.Object3D();
// Ronda de revisión creativa del Acto I, punto 7: la fusión Galaxies+Chains
// (antes actos 3+4, ahora un único acto 3) desplaza -1 todo lo posterior.
// Antes: MARKET_MOVES_CHAPTER=10, YOUR_UNIVERSE_CHAPTER=11.
const MARKET_MOVES_CHAPTER = 9;
const YOUR_UNIVERSE_CHAPTER = 10;

// Las configuraciones que recorre todo el arco del NFFC (Actos II y III),
// calculadas una sola vez a nivel de módulo (nunca en render): scatter de
// galaxia (cap. 06, estado de partida), tres variantes orbitales de la
// composición featured (cap. 06 destino / cap. 07 reconfiguraciones / cap.
// 08 fijado), la hélice (cap. 09), el reparto de actividad de mercado
// (cap. 10, data/market.js) y las categorías de la cuenta de usuario
// (cap. 11, NFFC_SYSTEM.yourUniverseCategories).
const galaxyScatter = buildGalaxyScatterLayout(COUNT, NFFC_SYSTEM.galaxyScatter);
const orbitalV0 = buildOrbitalLayout(FEATURED_NFFC.composition, COUNT, 0);
const orbitalV1 = buildOrbitalLayout(FEATURED_NFFC.composition, COUNT, 1);
const orbitalV2 = buildOrbitalLayout(FEATURED_NFFC.composition, COUNT, 2);
const helix = buildHelixLayout(NFFC_SYSTEM.helixLayers, COUNT);
const marketV0 = buildOrbitalLayout(MARKET.activity, COUNT, 0);
const marketV1 = buildOrbitalLayout(MARKET.activity, COUNT, 2);
const yourUniverseLayout = buildOrbitalLayout(NFFC_SYSTEM.yourUniverseCategories, COUNT, 1);

// Índices de instancia representativos por anillo — NffcLabels.jsx (y su
// reutilización en el capítulo 11) proyectan estas posiciones vía
// nffcBridge para anclar cada etiqueta junto a su anillo. Dos conjuntos
// porque el capítulo 07 (5 activos) y el 11 (4 categorías) no comparten
// reparto de instancias por anillo.
const ringAnchorIndices = FEATURED_NFFC.composition.map((_, ringIndex) =>
  orbitalV0.ringIndexByInstance.indexOf(ringIndex)
);
const categoryAnchorIndices = NFFC_SYSTEM.yourUniverseCategories.map((_, ringIndex) =>
  yourUniverseLayout.ringIndexByInstance.indexOf(ringIndex)
);
nffcBridge.ringAnchors = ringAnchorIndices.map(() => ({ x: 0, y: 0, z: 0 }));
nffcBridge.categoryAnchors = categoryAnchorIndices.map(() => ({ x: 0, y: 0, z: 0 }));

// Capítulo (índice) -> [A, B, C] que blend3/blend1 interpolan con el
// progreso local de ESE capítulo. chapterIndex <= 5 es precalentamiento
// (capítulo 05, "the-universe"): el material ya está montado y compilado,
// invisible, un capítulo antes de su debut real en el 06 — ver
// Experience.jsx y el fix del hitch de CollectionsField en el Interludio.
function getConfigForChapter(chapterIndex) {
  if (chapterIndex <= 5) return [galaxyScatter, orbitalV0, orbitalV0];
  if (chapterIndex === 6) return [orbitalV0, orbitalV1, orbitalV2];
  if (chapterIndex === 7) return [orbitalV2, orbitalV2, orbitalV2];
  if (chapterIndex === 8) return [orbitalV2, helix, helix];
  // Cap. 10 (The Market Moves): vuelve de la hélice a una vista orbital de
  // actividad, con una segunda reconfiguración a mitad de capítulo.
  if (chapterIndex === MARKET_MOVES_CHAPTER) return [helix, marketV0, marketV1];
  // Cap. 11 (Your Universe): la actividad de mercado da paso a las
  // categorías de la cuenta del usuario, que se quedan fijas el resto del
  // capítulo.
  if (chapterIndex === YOUR_UNIVERSE_CHAPTER) return [marketV1, yourUniverseLayout, yourUniverseLayout];
  return [yourUniverseLayout, yourUniverseLayout, yourUniverseLayout];
}

// Progreso local (0-1) del capítulo activo, y su opacidad: invisible
// durante el precalentamiento, entra en el 06 a la vez que la galaxia hero
// se apaga (ver UniverseParticles.jsx), llena a partir de ahí y hasta que
// se desmonta tras el capítulo 11 (tuning.js NFFC_SYSTEM; Experience.jsx).
function getLocalProgressAndOpacity(chapterIndex, chapterProgress) {
  if (chapterIndex === 5) {
    const p = getActProgress(chapterIndex, chapterProgress, 5);
    return [p, p];
  }
  if (chapterIndex >= 6 && chapterIndex <= YOUR_UNIVERSE_CHAPTER) {
    return [getActProgress(chapterIndex, chapterProgress, chapterIndex), 1];
  }
  return [0, 0];
}

// Picos de actividad del capítulo 10 (data/market.js `bursts`): un pulso
// gaussiano breve y colectivo (amplifica jitter/tamaño un instante), no un
// sistema de partículas nuevo — "particle bursts" logrados animando los
// mismos uniforms/atributos ya disponibles, como pide el brief.
function getBurstPulse(chapterIndex, localP) {
  if (chapterIndex !== MARKET_MOVES_CHAPTER) return 0;
  let maxPulse = 0;
  for (const burstAt of MARKET.bursts) {
    const d = Math.abs(localP - burstAt);
    const pulse = Math.exp(-Math.pow(d / 0.05, 2));
    if (pulse > maxPulse) maxPulse = pulse;
  }
  return maxPulse;
}

export default function NffcSystem() {
  const meshRef = useRef();
  const groupRef = useRef();
  const colorAttrRef = useRef();
  const configRef = useRef(getConfigForChapter(0));
  const chapterIndex = useChapterIndex();

  const colorMixArray = useMemo(() => new Float32Array(COUNT), []);
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);

  useEffect(() => {
    configRef.current = getConfigForChapter(chapterIndex);
  }, [chapterIndex]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const { chapterIndex: idx, chapterProgress } = scrollStore.getState();
    const [localP, opacity] = getLocalProgressAndOpacity(idx, chapterProgress);
    const burstPulse = getBurstPulse(idx, localP);
    const jitterAmount = NFFC_SYSTEM.jitterAmount * (1 + burstPulse * 2.2);
    const burstScale = 1 + burstPulse * 0.6;

    const [a, b, c] = configRef.current;
    const t = state.clock.elapsedTime;
    const rotY = t * NFFC_SYSTEM.groupRotationSpeed;
    const cosRot = Math.cos(rotY);
    const sinRot = Math.sin(rotY);

    for (let i = 0; i < COUNT; i += 1) {
      const [x, y, z] = blend3(a.positions[i], b.positions[i], c.positions[i], localP);
      const jitterX = Math.sin(t * NFFC_SYSTEM.jitterFrequency + i * 12.9) * jitterAmount;
      const jitterY = Math.cos(t * NFFC_SYSTEM.jitterFrequency * 1.3 + i * 7.3) * jitterAmount;
      const localX = x + jitterX;
      const localY = y + jitterY;
      dummy.position.set(localX, localY, z);
      dummy.scale.setScalar(NFFC_SYSTEM.nodeSize * burstScale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      colorMixArray[i] = blend1(a.colorMix[i], b.colorMix[i], c.colorMix[i], localP);

      const worldX = localX * cosRot + z * sinRot;
      const worldZ = -localX * sinRot + z * cosRot;
      const ringAnchor = ringAnchorIndices.indexOf(i);
      if (ringAnchor !== -1) {
        const anchor = nffcBridge.ringAnchors[ringAnchor];
        anchor.x = worldX;
        anchor.y = localY;
        anchor.z = worldZ;
      }
      const categoryAnchor = categoryAnchorIndices.indexOf(i);
      if (categoryAnchor !== -1) {
        const anchor = nffcBridge.categoryAnchors[categoryAnchor];
        anchor.x = worldX;
        anchor.y = localY;
        anchor.z = worldZ;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (colorAttrRef.current) colorAttrRef.current.needsUpdate = true;
    nffcBridge.visible = idx === 6;
    nffcBridge.categoryVisible = idx === YOUR_UNIVERSE_CHAPTER;

    if (groupRef.current) {
      groupRef.current.rotation.y = rotY;
    }
    if (mesh.material) {
      mesh.material.uOpacity = opacity;
      mesh.material.uBurstAmount = burstPulse;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[geometry, undefined, COUNT]} frustumCulled={false}>
        <instancedBufferAttribute
          ref={colorAttrRef}
          attach="geometry-attributes-aColorMix"
          args={[colorMixArray, 1]}
        />
        <orbitalMaterial
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          uOpacity={0}
        />
      </instancedMesh>
    </group>
  );
}
