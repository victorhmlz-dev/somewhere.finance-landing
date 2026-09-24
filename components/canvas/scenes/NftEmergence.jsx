"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { isMobile } from "@/lib/tuning";

// Arte de marcador de posición generado aquí mismo (canvas 2D, abstracto,
// paleta del proyecto) — nunca imágenes reales de colecciones NFT
// existentes, para no arrastrar ningún riesgo de derechos de autor. Todo el
// canvas de r3f carga solo en cliente (ExperienceLoader usa
// next/dynamic con ssr:false), así que generar aquí con
// document.createElement en scope de módulo es seguro — mismo criterio que
// el resto de generadores de este archivo (createGalaxyAttributes, etc.).
const COUNT = isMobile ? 3 : 6;
const PALETTE = ["#5142fc", "#af50e5", "#ffffff", "#22d3ee", "#22c55e"];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateArtTexture(seed) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const rand = seededRandom(seed);

  ctx.fillStyle = "#14141f";
  ctx.fillRect(0, 0, size, size);

  const shapeCount = 3 + Math.floor(rand() * 3);
  for (let i = 0; i < shapeCount; i += 1) {
    ctx.globalAlpha = 0.32 + rand() * 0.4;
    ctx.fillStyle = PALETTE[Math.floor(rand() * PALETTE.length)];
    const cx = rand() * size;
    const cy = rand() * size;
    const r = 12 + rand() * 38;
    if (rand() > 0.5) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rand() * Math.PI);
      ctx.fillRect(-r / 2, -r / 2, r, r);
      ctx.restore();
    }
  }

  ctx.globalAlpha = 1;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.strokeRect(3, 3, size - 6, size - 6);

  return new THREE.CanvasTexture(canvas);
}

function randomDirection() {
  const z = 1 - 2 * Math.random();
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  const theta = Math.random() * Math.PI * 2;
  return [r * Math.cos(theta), r * Math.sin(theta), z];
}

function createCards(count) {
  return Array.from({ length: count }, (_, i) => {
    const [dx, dy, dz] = randomDirection();
    const dist = 6 + Math.random() * 6;
    return {
      texture: generateArtTexture(i * 97 + 13),
      basePosition: [dx * dist, dy * dist, dz * dist],
      driftSeed: Math.random() * Math.PI * 2,
      // Escalonadas: no todas "salen" de la nebulosa a la vez.
      revealAt: 0.5 + i * 0.06,
    };
  });
}

const cards = createCards(COUNT);

function NftCard({ card }) {
  const materialRef = useRef();
  const groupRef = useRef();

  useFrame((state) => {
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const p3 = getActProgress(chapterIndex, chapterProgress, 2);
    const p4 = getActProgress(chapterIndex, chapterProgress, 3);
    const appear = Math.min(Math.max((p3 - card.revealAt) / 0.16, 0), 1);
    // Se apagan según colapsa la Nebula en galaxia (acto 4): son parte del
    // lenguaje de "colecciones emergiendo", no del capítulo siguiente.
    const fadeOut = 1 - Math.min(p4 / 0.25, 1);
    const opacity = appear * fadeOut * 0.92;

    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      groupRef.current.position.set(
        card.basePosition[0] + Math.sin(t * 0.3 + card.driftSeed) * 0.4,
        card.basePosition[1] + Math.cos(t * 0.25 + card.driftSeed) * 0.4,
        card.basePosition[2]
      );
    }
    if (materialRef.current) {
      materialRef.current.opacity = opacity;
    }
  });

  return (
    <Billboard ref={groupRef}>
      <mesh scale={[1.6, 1.6, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial ref={materialRef} map={card.texture} transparent opacity={0} depthWrite={false} />
      </mesh>
    </Billboard>
  );
}

export default function NftEmergence() {
  if (COUNT === 0) return null;
  return (
    <>
      {cards.map((card, i) => (
        <NftCard key={i} card={card} />
      ))}
    </>
  );
}
