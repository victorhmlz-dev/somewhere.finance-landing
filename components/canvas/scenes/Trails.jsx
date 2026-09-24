"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";

const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
const COUNT = isMobile ? 0 : 46; // en móvil se omiten: es el efecto más prescindible

function randomDirection() {
  const z = 1 - 2 * Math.random();
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  const theta = Math.random() * Math.PI * 2;
  return new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta), z);
}

function createTrailData(count) {
  return Array.from({ length: count }, () => ({
    direction: randomDirection(),
    speed: 0.6 + Math.random() * 1.2,
    delay: Math.random() * 0.12,
    thickness: 0.01 + Math.random() * 0.014,
  }));
}

const trailData = createTrailData(COUNT);
const dummy = new THREE.Object3D();
const Z_AXIS = new THREE.Vector3(0, 0, 1);

// Segmentos alargados que siguen a las partículas del Big Bang: más largos
// cuanto mayor es la velocidad instantánea de la explosión (derivada del
// ease-out), se afinan según decelera.
export default function Trails() {
  const meshRef = useRef();
  const materialRef = useRef();
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh || COUNT === 0) return;
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const p2 = getActProgress(chapterIndex, chapterProgress, 1);
    const p3 = getActProgress(chapterIndex, chapterProgress, 2);

    for (let i = 0; i < trailData.length; i += 1) {
      const t = trailData[i];
      const local = Math.min(Math.max((p2 - t.delay) / (1 - t.delay), 0), 1);
      const dist = (1 - Math.pow(1 - local, 3)) * (4 + t.speed * 14);
      const velocity = 3 * Math.pow(1 - local, 2) * (4 + t.speed * 14);
      const trailLength = Math.min(dist * 0.9, velocity * 0.16);

      dummy.position.copy(t.direction).multiplyScalar(Math.max(dist - trailLength / 2, 0));
      dummy.quaternion.setFromUnitVectors(Z_AXIS, t.direction);
      dummy.scale.set(t.thickness, t.thickness, Math.max(trailLength, 0.001));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    if (materialRef.current) {
      const appear = Math.min(p2 / 0.1, 1);
      const fade = 1 - Math.min(Math.max((p2 - 0.6) / 0.4, 0), 1) * Math.min(Math.max((p3) * 3, 0), 1);
      materialRef.current.opacity = appear * fade * 0.32;
    }
  });

  if (COUNT === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, COUNT]} frustumCulled={false}>
      <meshBasicMaterial
        ref={materialRef}
        color="#8f7cff"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
