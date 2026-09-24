"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { BIGBANG, UNIVERSE_ENDING } from "@/lib/tuning";

const { peakAt, sigma, intensity } = BIGBANG.flash;
const FLASH_COLOR = new THREE.Color(intensity, intensity, intensity);
const UNIVERSE_ENDING_CHAPTER = 4;

// Reutilizado en dos momentos (restructuración a 5 capítulos): el Big Bang
// (acto 1) y el cierre de "The Universe" (acto 4, ver UNIVERSE_ENDING en
// lib/tuning.js) — mismo mesh/material, cada uno con su propio timing.
// Compartido también con PostFX (aberración cromática, solo Big Bang) y
// peakMoments.js (letterbox/lens-streak, ambos momentos) para que todos
// disparen exactamente en el mismo instante sin duplicar el estado.
export function getFlashPeak(chapterIndex, chapterLocalProgress) {
  if (chapterIndex === 1) {
    return Math.exp(-Math.pow((chapterLocalProgress - peakAt) / sigma, 2));
  }
  if (chapterIndex === UNIVERSE_ENDING_CHAPTER) {
    return Math.exp(
      -Math.pow((chapterLocalProgress - UNIVERSE_ENDING.flashPeakAt) / UNIVERSE_ENDING.flashSigma, 2)
    );
  }
  return 0;
}

// Flash blanco en el pico de cada momento: color por encima de 1 (toneMapped
// false) para que el umbral de luminancia del bloom lo capture con fuerza,
// con una caída rápida (gaussiana) justo al llegar al pico.
export default function Flash() {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame(() => {
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const actIndex = chapterIndex === UNIVERSE_ENDING_CHAPTER ? UNIVERSE_ENDING_CHAPTER : 1;
    const localP = getActProgress(chapterIndex, chapterProgress, actIndex);
    const peak = getFlashPeak(chapterIndex, localP);
    const scale = 0.5 + localP * 2.2;

    if (meshRef.current) meshRef.current.scale.setScalar(scale);
    if (materialRef.current) materialRef.current.opacity = peak;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshBasicMaterial
        ref={materialRef}
        color={FLASH_COLOR}
        toneMapped={false}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
