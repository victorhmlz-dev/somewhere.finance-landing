"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { BIGBANG } from "@/lib/tuning";

const { count: COUNT_PER_SHAPE, maxDistance: FRAGMENT_MAX_DISTANCE, scaleRange } = BIGBANG.fragments;

function randomDirection() {
  const z = 1 - 2 * Math.random();
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  const theta = Math.random() * Math.PI * 2;
  return new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta), z);
}

// Datos por instancia generados una sola vez a nivel de módulo.
function createInstances(count) {
  return Array.from({ length: count }, () => ({
    direction: randomDirection(),
    speed: 0.7 + Math.random() * 1.3,
    rotationAxis: randomDirection(),
    rotationSpeed: (0.5 + Math.random()) * (Math.random() < 0.5 ? -1 : 1),
    baseScale: scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]),
    delay: Math.random() * 0.18,
  }));
}

const tetraInstances = createInstances(COUNT_PER_SHAPE);
const shardInstances = createInstances(COUNT_PER_SHAPE);

const dummy = new THREE.Object3D();
const PRIMARY = new THREE.Color("#5142fc");

function FragmentGroup({ geometry, instances, maxDistance }) {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const p2 = getActProgress(chapterIndex, chapterProgress, 1);
    const p3 = getActProgress(chapterIndex, chapterProgress, 2);

    for (let i = 0; i < instances.length; i += 1) {
      const inst = instances[i];
      const local = Math.min(Math.max((p2 - inst.delay) / (1 - inst.delay), 0), 1);
      const eased = 1 - Math.pow(1 - local, 3);
      const dist = eased * maxDistance * (0.6 + inst.speed * 0.4);

      dummy.position.copy(inst.direction).multiplyScalar(dist);
      dummy.rotation.set(
        clock.elapsedTime * inst.rotationSpeed * 0.4,
        clock.elapsedTime * inst.rotationSpeed * 0.6,
        clock.elapsedTime * inst.rotationSpeed * 0.3
      );
      const scale = inst.baseScale * (0.7 + eased * 0.6);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    if (materialRef.current) {
      const appear = 1 - Math.pow(1 - Math.min(p2 / 0.15, 1), 2);
      const fade = 1 - Math.min(Math.max((p3 - 0.55) / 0.45, 0), 1);
      materialRef.current.opacity = appear * fade * 0.85;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, instances.length]} frustumCulled={false}>
      <meshStandardMaterial
        ref={materialRef}
        color="#e8e6ff"
        metalness={0.35}
        roughness={0.3}
        emissive={PRIMARY}
        emissiveIntensity={0.5}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

export default function Fragments() {
  const tetraGeometry = useMemo(() => new THREE.TetrahedronGeometry(1, 0), []);
  const shardGeometry = useMemo(() => new THREE.BoxGeometry(1.4, 1.4, 0.06), []);

  return (
    <>
      <FragmentGroup
        geometry={tetraGeometry}
        instances={tetraInstances}
        maxDistance={FRAGMENT_MAX_DISTANCE}
      />
      <FragmentGroup
        geometry={shardGeometry}
        instances={shardInstances}
        maxDistance={FRAGMENT_MAX_DISTANCE * 1.15}
      />
    </>
  );
}
