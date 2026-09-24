"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { UNIVERSE_LOD, UNIVERSE_ENDING } from "@/lib/tuning";
import { createGalaxyAttributes } from "@/lib/shaders/galaxyAttributes";
import Galaxy from "./Galaxy";
import "./BillboardGalaxyMaterial";

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

function randomDirection() {
  const z = 1 - 2 * Math.random();
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  const theta = Math.random() * Math.PI * 2;
  return [r * Math.cos(theta), r * Math.sin(theta), z];
}

// LOD: unas pocas galaxias cercanas con partículas reales (createGalaxyAttributes,
// igual que colecciones/chains) y cientos/miles de galaxias lejanas como
// billboards instanciados baratos (ver BillboardGalaxyMaterial) — con miles
// de galaxias, un sistema de partículas completo por cada una no es viable.
// Ambos campos se generan una sola vez a nivel de módulo; nada se crea ni se
// destruye por frame, ni siquiera las posiciones lejanas (estáticas, solo
// gira el material entero vía un uniform de tiempo).
// `direction`/`dist`/`yFactor` se conservan por item (no solo la `position`
// derivada) para el cierre de "the-universe": converger es simplemente
// encoger ese mismo `dist` hacia 0 con el progreso local del cierre — el
// reverso exacto de cómo Fragments/Trails/CoinBurst alejan sus instancias
// del origen multiplicando `direction * distancia creciente` en el Big Bang.
function buildNearGalaxies() {
  const { galaxyCount, particlesPerGalaxy, fieldRadius } = UNIVERSE_LOD.near;
  const armOptions = [2, 3, 4, 5, 6];
  return Array.from({ length: galaxyCount }, (_, i) => {
    const direction = randomDirection();
    const dist = fieldRadius * (0.35 + Math.random() * 0.65);
    const armCount = armOptions[i % armOptions.length];
    const config = {
      armCount,
      tightness: 2.4 + Math.random() * 2.4,
      radius: 4 + Math.random() * 6,
      thickness: 0.12 + Math.random() * 0.15,
      noiseAmount: 0.05 + Math.random() * 0.1,
      rotationSpeed: 0.03 + Math.random() * 0.08,
      coreSize: 0.15 + Math.random() * 0.15,
      particleScale: 0.8 + Math.random() * 0.5,
      position: [direction[0] * dist, direction[1] * dist * 0.4, direction[2] * dist],
    };
    const attrs = createGalaxyAttributes(particlesPerGalaxy, {
      armCount,
      colorMixCenter: Math.random(),
      sizeRange: [1.2, 2.8],
    });
    return { config, attrs, direction, dist };
  });
}

function buildFarField() {
  const { instanceCount, fieldRadiusMin, fieldRadiusMax, billboardSize } = UNIVERSE_LOD.far;
  const items = [];
  for (let i = 0; i < instanceCount; i += 1) {
    const direction = randomDirection();
    const dist = fieldRadiusMin + Math.random() * (fieldRadiusMax - fieldRadiusMin);
    const size = billboardSize[0] + Math.random() * (billboardSize[1] - billboardSize[0]);
    items.push({
      direction,
      dist,
      position: [direction[0] * dist, direction[1] * dist * 0.5, direction[2] * dist],
      size,
      colorMix: Math.random(),
      armCount: 2 + Math.floor(Math.random() * 5),
      tightness: 1.5 + Math.random() * 3,
      seed: Math.random(),
      rotationSpeed: (Math.random() - 0.5) * 0.08,
    });
  }
  return items;
}

// 0 fuera del cierre; rampa 0→1 durante UNIVERSE_ENDING.convergeStart/End.
// Solo chapterIndex===4 puede devolver algo distinto de 0 — el resto de
// capítulos nunca pagan este cálculo de más.
function getConvergeShrink() {
  const { chapterIndex, chapterProgress } = scrollStore.getState();
  if (chapterIndex !== 4) return 0;
  const p5 = getActProgress(chapterIndex, chapterProgress, 4);
  if (p5 < UNIVERSE_ENDING.convergeStart) return 0;
  return Math.min(
    Math.max((p5 - UNIVERSE_ENDING.convergeStart) / (UNIVERSE_ENDING.convergeEnd - UNIVERSE_ENDING.convergeStart), 0),
    1
  );
}

const nearGalaxies = buildNearGalaxies();
const farField = buildFarField();
const dummy = new THREE.Object3D();

function FarField({ getOpacity }) {
  const meshRef = useRef();
  const materialRef = useRef();

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const { colorMixAttr, armCountAttr, tightnessAttr, seedAttr, rotationSpeedAttr } = useMemo(() => {
    const count = farField.length;
    const colorMixArr = new Float32Array(count);
    const armCountArr = new Float32Array(count);
    const tightnessArr = new Float32Array(count);
    const seedArr = new Float32Array(count);
    const rotationSpeedArr = new Float32Array(count);
    farField.forEach((item, i) => {
      colorMixArr[i] = item.colorMix;
      armCountArr[i] = item.armCount;
      tightnessArr[i] = item.tightness;
      seedArr[i] = item.seed;
      rotationSpeedArr[i] = item.rotationSpeed;
    });
    return {
      colorMixAttr: colorMixArr,
      armCountAttr: armCountArr,
      tightnessAttr: tightnessArr,
      seedAttr: seedArr,
      rotationSpeedAttr: rotationSpeedArr,
    };
  }, []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    // Posición recalculada cada frame (en vez de fijada una sola vez al
    // montar): el cierre de "the-universe" necesita poder encoger `dist`
    // hacia 0 en cualquier momento, incluso si el usuario retrocede y
    // vuelve a avanzar sobre el propio cierre. El coste (1400 instancias,
    // solo aritmética vectorial, sin trigonometría) es del mismo orden que
    // el bucle por instancia que ya hace NffcSystem.jsx cada frame.
    const shrink = getConvergeShrink();
    farField.forEach((item, i) => {
      const scale = 1 - shrink;
      dummy.position.set(
        item.direction[0] * item.dist * scale,
        item.direction[1] * item.dist * 0.5 * scale,
        item.direction[2] * item.dist * scale
      );
      dummy.scale.set(item.size, item.size, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;

    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
      materialRef.current.uOpacity = getOpacity();
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, farField.length]} frustumCulled={false}>
      <instancedBufferAttribute attach="geometry-attributes-aColorMix" args={[colorMixAttr, 1]} />
      <instancedBufferAttribute attach="geometry-attributes-aArmCount" args={[armCountAttr, 1]} />
      <instancedBufferAttribute attach="geometry-attributes-aTightness" args={[tightnessAttr, 1]} />
      <instancedBufferAttribute attach="geometry-attributes-aSeed" args={[seedAttr, 1]} />
      <instancedBufferAttribute attach="geometry-attributes-aRotationSpeed" args={[rotationSpeedAttr, 1]} />
      <billboardGalaxyMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

// Restructuración a 5 capítulos: este campo ya no se desvanece para dejar
// paso a "nffc" (archivado, ver docs/ARCHIVED_NFFC_ACT.md) ni reaparece en
// "one-universe" (también archivado) — se revela una vez, en el acto 5, y se
// queda a plena opacidad hasta que el cierre del propio capítulo lo hace
// converger hacia el origen (ver getConvergeShrink arriba).
export default function UniverseField() {
  const getNearProgress = () => {
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const p5 = getActProgress(chapterIndex, chapterProgress, 4);
    return clamp01(p5 / 0.3);
  };
  const getNearOpacity = () => {
    const shrink = getConvergeShrink();
    return shrink > 0 ? 1 - shrink * 0.6 : 1; // se atenúa, no desaparece del todo, al converger
  };
  const getFarOpacity = () => {
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const p5 = getActProgress(chapterIndex, chapterProgress, 4);
    const shrink = getConvergeShrink();
    const base = clamp01((p5 - 0.1) / 0.35) * 0.8;
    return shrink > 0 ? base * (1 - shrink * 0.6) : base;
  };
  const getNearPosition = (item) => () => {
    const shrink = getConvergeShrink();
    const scale = 1 - shrink;
    return [item.direction[0] * item.dist * scale, item.direction[1] * item.dist * 0.4 * scale, item.direction[2] * item.dist * scale];
  };

  return (
    <>
      {nearGalaxies.map((item, i) => (
        <Galaxy
          key={`near-${i}`}
          config={item.config}
          attrs={item.attrs}
          getProgress={getNearProgress}
          getOpacity={getNearOpacity}
          getPosition={getNearPosition(item)}
        />
      ))}
      <FarField getOpacity={getFarOpacity} />
    </>
  );
}
