"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { NEBULA_ENTRY } from "@/lib/tuning";

const { streakCount: COUNT, streakDistanceRange, streakLengthRange } = NEBULA_ENTRY;

function randomDirection() {
  const z = 1 - 2 * Math.random();
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  const theta = Math.random() * Math.PI * 2;
  return new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta), z);
}

function createStreakData(count) {
  return Array.from({ length: count }, () => ({
    direction: randomDirection(),
    distance: streakDistanceRange[0] + Math.random() * (streakDistanceRange[1] - streakDistanceRange[0]),
    length: streakLengthRange[0] + Math.random() * (streakLengthRange[1] - streakLengthRange[0]),
    thickness: 0.02 + Math.random() * 0.03,
  }));
}

const streakData = createStreakData(COUNT);
const dummy = new THREE.Object3D();
const Z_AXIS = new THREE.Vector3(0, 0, 1);

// "Viaje espacial a alta velocidad" en la transición 02→03: streaks
// radiales que aparecen en un pico gaussiano breve justo al entrar en la
// Nebula (mismo pico que el FOV punch de CameraRig.jsx) y se desvanecen en
// cuanto se asienta. meshBasicMaterial estándar — la misma combinación que
// ya usan Fragments/Trails desde el capítulo 0, sin coste de compilación
// nuevo. Con prefers-reduced-motion no se activa nunca: el capítulo pasa
// directo a su encuadre final, sin sensación de velocidad.
export default function WarpStreaks() {
  const meshRef = useRef();
  const materialRef = useRef();
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = media.matches;
    const onChange = (e) => {
      reducedMotionRef.current = e.matches;
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh || COUNT === 0) return;
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const p3 = getActProgress(chapterIndex, chapterProgress, 2);
    const warp =
      chapterIndex === 2 && !reducedMotionRef.current
        ? Math.exp(-Math.pow(p3 / NEBULA_ENTRY.sigma, 2))
        : 0;

    for (let i = 0; i < streakData.length; i += 1) {
      const s = streakData[i];
      dummy.position.copy(s.direction).multiplyScalar(s.distance);
      dummy.quaternion.setFromUnitVectors(Z_AXIS, s.direction);
      const len = s.length * (0.15 + warp * 1.6);
      dummy.scale.set(s.thickness, s.thickness, len);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    if (materialRef.current) {
      materialRef.current.opacity = warp * 0.55;
    }
  });

  if (COUNT === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, COUNT]} frustumCulled={false}>
      <meshBasicMaterial
        ref={materialRef}
        color="#c9d4ff"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
