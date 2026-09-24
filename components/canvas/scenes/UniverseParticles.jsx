"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { PARTICLES, SINGULARITY, BIGBANG, GALAXY_MORPH, UNIVERSE_ENDING, isMobile } from "@/lib/tuning";
import "./UniverseParticleMaterial";

const CLUSTER_COUNT = 5;
// Restructuración a 5 capítulos: ya no hay un capítulo "final" propio (se
// archivó junto al resto del Acto II, ver docs/ARCHIVED_NFFC_ACT.md) — el
// mecanismo de "rebobinar hasta el punto de luz" que antes se activaba al
// ENTRAR en ese capítulo se reutiliza aquí, retriggered dentro del propio
// cierre de "the-universe" (UNIVERSE_ENDING.convergeStart/End).
const UNIVERSE_ENDING_CHAPTER = 4;

function randomDirection() {
  const z = 1 - 2 * Math.random();
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  const theta = Math.random() * Math.PI * 2;
  return [r * Math.cos(theta), r * Math.sin(theta), z];
}

// Distribución con cola larga en vez de un rango uniforme: la mayoría de las
// partículas caen en la clase pequeña, muy pocas en la grande.
function pickWeightedSize(classes) {
  const total = classes.reduce((sum, c) => sum + c.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < classes.length; i += 1) {
    if (r < classes[i].weight) return classes[i].size;
    r -= classes[i].weight;
  }
  return classes[classes.length - 1].size;
}

// Genera los atributos de una capa una sola vez (a nivel de módulo, nunca
// dentro del render) para no llamar a Math.random durante el ciclo de React.
function createLayerAttributes(def) {
  const { count, sizeClasses, clusterRadius, spread, colorMixRange } = def;
  const position = new Float32Array(count * 3);
  const aDirection = new Float32Array(count * 3);
  const aSeed = new Float32Array(count);
  const aSpeed = new Float32Array(count);
  const aBaseSize = new Float32Array(count);
  const aColorMix = new Float32Array(count);
  const aNebulaBase = new Float32Array(count * 3);
  // Atributos del objetivo "galaxia" (acto 4) — mismo esquema que
  // lib/shaders/galaxyAttributes.js, generados aquí para no duplicar buffers.
  const aRadiusSeed = new Float32Array(count);
  const aArmIndex = new Float32Array(count);
  const aAngleJitter = new Float32Array(count);
  const aHeightSeed = new Float32Array(count);

  const [mixMin, mixMax] = colorMixRange;
  const clusters = Array.from({ length: CLUSTER_COUNT }, () => {
    const [x, y, z] = randomDirection();
    const r = spread * (0.5 + Math.random() * 0.5);
    return [x * r, y * r, z * r];
  });

  for (let i = 0; i < count; i += 1) {
    const [dx, dy, dz] = randomDirection();
    aDirection[i * 3] = dx;
    aDirection[i * 3 + 1] = dy;
    aDirection[i * 3 + 2] = dz;

    aSeed[i] = Math.random();
    aSpeed[i] = 0.4 + Math.random() * 1.0;
    aBaseSize[i] = pickWeightedSize(sizeClasses);
    aColorMix[i] = mixMin + Math.random() * (mixMax - mixMin);

    const cluster = clusters[i % CLUSTER_COUNT];
    const [ox, oy, oz] = randomDirection();
    const or_ = clusterRadius * Math.random();
    aNebulaBase[i * 3] = cluster[0] + ox * or_;
    aNebulaBase[i * 3 + 1] = cluster[1] + oy * or_;
    aNebulaBase[i * 3 + 2] = cluster[2] + oz * or_;

    // Radio mínimo garantizado: sin él, demasiadas partículas convergen a
    // radio≈0 y el bloom las funde en un núcleo saturado sin forma.
    aRadiusSeed[i] = 0.12 + Math.pow(Math.random(), 2.2) * 0.88;
    aArmIndex[i] = Math.floor(Math.random() * GALAXY_MORPH.armCount);
    aAngleJitter[i] = (Math.random() - 0.5) * 0.5;
    aHeightSeed[i] = Math.random() * 2 - 1;
  }

  return {
    position,
    aDirection,
    aSeed,
    aSpeed,
    aBaseSize,
    aColorMix,
    aNebulaBase,
    aRadiusSeed,
    aArmIndex,
    aAngleJitter,
    aHeightSeed,
  };
}

const LAYER_DEFS = Object.entries(PARTICLES).map(([key, def]) => ({ key, ...def }));
const layerAttributes = LAYER_DEFS.map((def) => createLayerAttributes(def));

function ParticleLayer({ def, attrs }) {
  const materialRef = useRef();
  const groupRef = useRef();
  const { gl } = useThree();

  useFrame((state) => {
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const p1 = getActProgress(chapterIndex, chapterProgress, 0);
    const p2 = getActProgress(chapterIndex, chapterProgress, 1);
    const p3 = getActProgress(chapterIndex, chapterProgress, 2);
    const p4 = getActProgress(chapterIndex, chapterProgress, 3);
    const p5 = getActProgress(chapterIndex, chapterProgress, 4);
    // Corrección de composición de "The Galaxies & Chains": ese capítulo ya
    // no tiene nada en el centro (dos galaxias-cúmulo independientes a los
    // lados, tarjeta de marca en medio) — la galaxia hero se desvanece casi
    // del todo nada más EMPEZAR el acto 4 para despejar el centro, y se
    // mantiene tenue durante todo "the-universe" (siguiente acto) como una
    // galaxia más del fondo del LOD, hasta que la convergencia final (más
    // abajo) la reforma como el punto de luz original.
    const chainsFade = chapterIndex >= 3 ? 1 - 0.88 * Math.min(p4 / 0.25, 1) : 1;
    // Cierre de "the-universe" (restructuración a 5 capítulos, sustituye al
    // antiguo capítulo "final" archivado — ver docs/ARCHIVED_NFFC_ACT.md):
    // en el último tramo del acto 5, esta MISMA galaxia se rebobina hasta el
    // punto de luz original. `convergeP` es el progreso LOCAL dentro de ese
    // tramo (0 al empezar a converger, 1 en el pico del destello) — uProgress1
    // decreciendo (la MISMA curva de crecimiento del acto 1, en reversa) y
    // uProgress5 creciendo tiran de `pos` de vuelta a esa forma por encima de
    // cualquier otro blend, ver el comentario en UniverseParticleMaterial.js.
    const isConverging = chapterIndex === UNIVERSE_ENDING_CHAPTER && p5 >= UNIVERSE_ENDING.convergeStart;
    const convergeP = isConverging
      ? Math.min(
          Math.max((p5 - UNIVERSE_ENDING.convergeStart) / (UNIVERSE_ENDING.convergeEnd - UNIVERSE_ENDING.convergeStart), 0),
          1
        )
      : 0;

    const mat = materialRef.current;
    if (mat) {
      mat.uTime = state.clock.elapsedTime;
      mat.uProgress1 = isConverging ? 1 - convergeP : p1;
      mat.uProgress2 = p2;
      mat.uProgress3 = p3;
      mat.uProgress4 = p4;
      mat.uProgress5 = isConverging ? convergeP : 0;
      mat.uOpacity = isConverging ? def.opacity * convergeP : def.opacity * chainsFade;
      mat.uPixelRatio = gl.getPixelRatio();
      // Releídos cada frame (no solo al crear el material) para que el
      // panel de ajuste de desarrollo (DevTuning) pueda cambiarlos en vivo.
      mat.uGrowthPower = SINGULARITY.growthPower;
      mat.uJitterBase = SINGULARITY.jitterBase;
      mat.uJitterMax = SINGULARITY.jitterMax;
      mat.uInhaleStart = SINGULARITY.inhaleStart;
      mat.uInhaleStrength = SINGULARITY.inhaleStrength;
      mat.uFogIntensity = chapterIndex === 0 ? SINGULARITY.fogIntensity : 0.85;
      mat.uEasePower = BIGBANG.easePower;
      mat.uGalaxyArmCount = GALAXY_MORPH.armCount;
      mat.uGalaxyTightness = GALAXY_MORPH.tightness;
      mat.uGalaxyRadius = GALAXY_MORPH.radius;
      mat.uGalaxyThickness = GALAXY_MORPH.thickness;
      mat.uGalaxyNoiseAmount = GALAXY_MORPH.noiseAmount;
      mat.uGalaxyRotationSpeed = GALAXY_MORPH.rotationSpeed;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * def.rotationSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[attrs.position, 3]} />
          <bufferAttribute attach="attributes-aDirection" args={[attrs.aDirection, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[attrs.aSeed, 1]} />
          <bufferAttribute attach="attributes-aSpeed" args={[attrs.aSpeed, 1]} />
          <bufferAttribute attach="attributes-aBaseSize" args={[attrs.aBaseSize, 1]} />
          <bufferAttribute attach="attributes-aColorMix" args={[attrs.aColorMix, 1]} />
          <bufferAttribute attach="attributes-aNebulaBase" args={[attrs.aNebulaBase, 3]} />
          <bufferAttribute attach="attributes-aRadiusSeed" args={[attrs.aRadiusSeed, 1]} />
          <bufferAttribute attach="attributes-aArmIndex" args={[attrs.aArmIndex, 1]} />
          <bufferAttribute attach="attributes-aAngleJitter" args={[attrs.aAngleJitter, 1]} />
          <bufferAttribute attach="attributes-aHeightSeed" args={[attrs.aHeightSeed, 1]} />
        </bufferGeometry>
        <universeParticleMaterial
          ref={materialRef}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uRadiusScale={def.radiusScale}
          uFogNear={def.fogNear}
          uFogFar={def.fogFar}
          uOpacity={def.opacity}
          uSizeScale={isMobile ? 0.85 : 1}
        />
      </points>
    </group>
  );
}

export default function UniverseParticles() {
  const layers = useMemo(
    () => LAYER_DEFS.map((def, i) => ({ def, attrs: layerAttributes[i] })),
    []
  );

  return (
    <>
      {layers.map(({ def, attrs }) => (
        <ParticleLayer key={def.key} def={def} attrs={attrs} />
      ))}
    </>
  );
}
