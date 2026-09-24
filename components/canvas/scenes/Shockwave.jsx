"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { BIGBANG } from "@/lib/tuning";
import "./ShockwaveMaterial";

const WHITE = new THREE.Color("#ffffff");
const ACCENT = new THREE.Color("#af50e5");

// Una cáscara con fresnel (ver justificación de FrontSide en el informe:
// con DoubleSide las caras traseras rellenaban el centro). `delay` retrasa
// el arranque dentro del acto 2 — la segunda onda sale detrás de la primera.
function ShockwaveWave({ maxRadius, delay, power }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const colorRef = useRef(new THREE.Color());

  useFrame(() => {
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const p2 = getActProgress(chapterIndex, chapterProgress, 1);
    const local = Math.min(Math.max((p2 - delay) / (1 - delay), 0), 1);
    const active = p2 > delay && p2 < 1;
    const eased = 1 - Math.pow(1 - local, 2);
    const radius = 0.3 + eased * maxRadius;
    const opacity = Math.sin(Math.min(local, 0.9) / 0.9 * Math.PI) * (active ? 1 : 0);

    if (meshRef.current) {
      meshRef.current.scale.setScalar(radius);
    }
    if (materialRef.current) {
      materialRef.current.uOpacity = Math.max(0, opacity) * 0.9;
      colorRef.current.copy(WHITE).lerp(ACCENT, Math.min(local * 0.7, 0.7));
      materialRef.current.uColor = colorRef.current;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 3]} />
      <shockwaveMaterial
        ref={materialRef}
        uPower={power}
        transparent
        depthWrite={false}
        side={THREE.FrontSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export default function Shockwave() {
  return (
    <>
      <ShockwaveWave {...BIGBANG.shockwave1} />
      <ShockwaveWave {...BIGBANG.shockwave2} />
    </>
  );
}
