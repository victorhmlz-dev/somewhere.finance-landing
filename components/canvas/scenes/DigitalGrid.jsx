"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { DIGITAL_GRID } from "@/lib/tuning";

function randomDirection() {
  const z = 1 - 2 * Math.random();
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  const theta = Math.random() * Math.PI * 2;
  return new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta), z);
}

// Constelación estática: puntos de datos unidos por líneas finas a sus
// vecinos más cercanos. Es textura ambiental ("lenguaje digital" del brief),
// no participa en la física de la explosión — de ahí que se calcule una
// sola vez a nivel de módulo.
function buildConstellation() {
  const { pointCount, connectionsPerPoint, spread } = DIGITAL_GRID;
  const points = Array.from({ length: pointCount }, () =>
    randomDirection().multiplyScalar(spread * (0.4 + Math.random() * 0.6))
  );

  const segments = [];
  for (let i = 0; i < points.length; i += 1) {
    const distances = points
      .map((p, j) => ({ j, d: i === j ? Infinity : points[i].distanceTo(p) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, connectionsPerPoint);
    distances.forEach(({ j }) => {
      if (j > i) segments.push(points[i], points[j]);
    });
  }

  const linePositions = new Float32Array(segments.length * 3);
  segments.forEach((v, i) => v.toArray(linePositions, i * 3));

  const pointPositions = new Float32Array(points.length * 3);
  points.forEach((v, i) => v.toArray(pointPositions, i * 3));

  return { linePositions, pointPositions };
}

function buildRing() {
  const { ringPoints, ringRadius, ringTilt } = DIGITAL_GRID;
  const positions = new Float32Array((ringPoints + 1) * 3);
  for (let i = 0; i <= ringPoints; i += 1) {
    const angle = (i / ringPoints) * Math.PI * 2;
    const x = Math.cos(angle) * ringRadius;
    const y = Math.sin(angle) * ringRadius * Math.sin(ringTilt);
    const z = Math.sin(angle) * ringRadius * Math.cos(ringTilt);
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
}

const { linePositions, pointPositions } = buildConstellation();
const ringPositions = buildRing();
const PRIMARY = new THREE.Color("#5142fc");

export default function DigitalGrid() {
  const groupRef = useRef();
  const lineMatRef = useRef();
  const pointMatRef = useRef();
  const ringMatRef = useRef();

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    return geo;
  }, []);
  const pointGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pointPositions, 3));
    return geo;
  }, []);
  const ringGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(ringPositions, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * DIGITAL_GRID.rotationSpeed;
    }

    // Tenue durante la Singularity (queremos tensión con poca información),
    // se abre según avanza el Big Bang y queda plena en la Nebula.
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const p1 = getActProgress(chapterIndex, chapterProgress, 0);
    const p2 = getActProgress(chapterIndex, chapterProgress, 1);
    const p3 = getActProgress(chapterIndex, chapterProgress, 2);
    const combined = (p1 + p2 + p3) / 3;
    const envelope = 0.28 + 0.72 * Math.min(combined / 0.42, 1);

    // Apagada solo en "The Galaxies & Chains" (capítulo 4, chapterIndex 3):
    // competía visualmente con la tarjeta central "somewhere.finance" y los
    // dos cúmulos — decisión explícita, solo para este capítulo. Reaparece
    // con un fade-in breve al entrar en "The Universe" (capítulo 5, idx 4)
    // en vez de un salto instantáneo; los capítulos 1-3 no se tocan (sceneFade
    // se queda en 1, igual que antes).
    let sceneFade = 1;
    if (chapterIndex === 3) {
      const p4 = getActProgress(chapterIndex, chapterProgress, 3);
      sceneFade = 1 - Math.min(p4 / 0.15, 1);
    } else if (chapterIndex === 4) {
      const p5 = getActProgress(chapterIndex, chapterProgress, 4);
      sceneFade = Math.min(p5 / 0.15, 1);
    }

    if (lineMatRef.current) lineMatRef.current.opacity = DIGITAL_GRID.opacity * envelope * sceneFade;
    if (pointMatRef.current) pointMatRef.current.opacity = DIGITAL_GRID.opacity * 1.4 * envelope * sceneFade;
    if (ringMatRef.current) ringMatRef.current.opacity = DIGITAL_GRID.opacity * 0.9 * envelope * sceneFade;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          ref={lineMatRef}
          color={PRIMARY}
          transparent
          opacity={DIGITAL_GRID.opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
      {/* sizeAttenuation=false a propósito: son puntos fijos en el mundo y
          la cámara viaja de z=8 a z=52 a través de ellos — con atenuación,
          cualquier punto que quede cerca de la cámara en un momento dado
          explota de tamaño en pantalla. */}
      <points geometry={pointGeometry}>
        <pointsMaterial
          ref={pointMatRef}
          color="#ffffff"
          size={3}
          sizeAttenuation={false}
          transparent
          opacity={DIGITAL_GRID.opacity * 1.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <lineLoop geometry={ringGeometry}>
        <lineBasicMaterial
          ref={ringMatRef}
          color={PRIMARY}
          transparent
          opacity={DIGITAL_GRID.opacity * 0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineLoop>
    </group>
  );
}
