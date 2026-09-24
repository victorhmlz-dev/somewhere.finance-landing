"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getCinematicPeak } from "@/lib/scroll/peakMoments";
import { CINEMATIC } from "@/lib/tuning";
import "./LensStreakMaterial";

// Destello anamórfico discreto: solo visible en los picos cinematográficos
// (Big Bang, y el mismo tratamiento reutilizado en el destello del cierre de
// "the-universe" — ver lib/scroll/peakMoments.js), nunca un lens flare
// permanente. Ambos picos están centrados en el origen (la galaxia hero
// vive ahí en los dos momentos), así que lensPosition no cambia. Se omite
// el componente entero en móvil (CINEMATIC.lensFlare.enabled).
export default function LensStreak() {
  const materialRef = useRef();

  useFrame(() => {
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const peak = getCinematicPeak(chapterIndex, chapterProgress);
    if (materialRef.current) {
      materialRef.current.uOpacity = peak * CINEMATIC.lensFlare.maxOpacity;
    }
  });

  return (
    <Billboard position={[0, 0, 0]}>
      <mesh scale={[9, 9, 1]}>
        <planeGeometry args={[1, 1]} />
        <lensStreakMaterial
          ref={materialRef}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </Billboard>
  );
}
