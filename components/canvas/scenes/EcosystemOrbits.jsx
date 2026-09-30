"use client";

import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { ECOSYSTEM_SCENE } from "@/lib/tuning";
import { getEcosystemReveal, getRingRadius } from "@/lib/ecosystemOrbits";

const GALAXIES = [ECOSYSTEM_SCENE.companies, ECOSYSTEM_SCENE.chains];

// Círculo unitario en el plano XY (el del disco, ver lib/shaders/galaxy.js);
// cada anillo lo escala a su radio. Geometría y material se crean una sola
// vez a nivel de módulo (mismo criterio que los atributos de
// EcosystemField.jsx) y los comparten todos los anillos.
function createCircleGeometry(segments) {
  const positions = new Float32Array(segments * 3);
  for (let i = 0; i < segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    positions[i * 3] = Math.cos(a);
    positions[i * 3 + 1] = Math.sin(a);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geometry;
}

const ringGeometry = createCircleGeometry(ECOSYSTEM_SCENE.orbits.segments);
const ringMaterial = new THREE.LineBasicMaterial({
  color: ECOSYSTEM_SCENE.orbits.lineColor,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});

// Anillos orbitales de "The Galaxies & Chains": líneas finas en el plano de
// cada disco, con su misma inclinación. Los iconos que los recorren viven en
// el DOM (EcosystemNodes.jsx) y usan la misma geometría
// (lib/ecosystemOrbits.js). Todos entran y salen a la vez.
export default function EcosystemOrbits() {
  useFrame(() => {
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    ringMaterial.opacity =
      getEcosystemReveal(chapterIndex, chapterProgress) * ECOSYSTEM_SCENE.orbits.lineOpacity;
  });

  return (
    <>
      {GALAXIES.map((galaxy, g) => (
        <group key={g} position={galaxy.position} rotation={galaxy.groupRotation}>
          {ECOSYSTEM_SCENE.orbits.radii.map((_, ring) => {
            const r = getRingRadius(galaxy, ring);
            return (
              <lineLoop
                key={ring}
                scale={[r, r, 1]}
                geometry={ringGeometry}
                material={ringMaterial}
                dispose={null}
              />
            );
          })}
        </group>
      ))}
    </>
  );
}
