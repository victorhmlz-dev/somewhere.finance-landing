"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { CHAINS } from "@/data/chains";
import { REAL_WORLD_ASSETS } from "@/data/archive/act-ii-nffc/realWorldAssets";

const GALAXIES_CHAINS_CHAPTER = 3;
const ONE_UNIVERSE_CHAPTER = 11;

// Ronda de revisión creativa del Acto I, punto 7: el mismo sistema de
// conectores (lineBasicMaterial estándar, acento cian) que antes solo servía
// al capítulo "One Universe" se reutiliza aquí vía `variant`, en vez de
// construir un componente nuevo — cada variant define su propio conjunto de
// segmentos y su propio acto de referencia para la curva de opacidad.
function buildGalaxiesChainsSegments() {
  const origin = new THREE.Vector3(0, 0, 0);
  const rwa = new THREE.Vector3(...REAL_WORLD_ASSETS.position);
  const segments = [];
  CHAINS.forEach((c) => {
    const p = new THREE.Vector3(...c.position);
    segments.push(p, origin); // chain -> materia espacial central
    segments.push(p, rwa); // chain -> real world assets
  });
  const positions = new Float32Array(segments.length * 3);
  segments.forEach((v, i) => v.toArray(positions, i * 3));
  return positions;
}

// Diseño original del capítulo "One Universe": bucle chain-a-chain más cada
// una al origen. Sin cambios funcionales, solo reubicado en esta variant.
function buildOneUniverseSegments() {
  const points = CHAINS.map((c) => new THREE.Vector3(...c.position));
  const origin = new THREE.Vector3(0, 0, 0);
  const segments = [];
  for (let i = 0; i < points.length; i += 1) {
    const next = points[(i + 1) % points.length];
    segments.push(points[i], next);
    segments.push(points[i], origin);
  }
  const positions = new Float32Array(segments.length * 3);
  segments.forEach((v, i) => v.toArray(positions, i * 3));
  return positions;
}

const segmentsByVariant = {
  galaxiesChains: buildGalaxiesChainsSegments(),
  oneUniverse: buildOneUniverseSegments(),
};

const actIndexByVariant = {
  galaxiesChains: GALAXIES_CHAINS_CHAPTER,
  oneUniverse: ONE_UNIVERSE_CHAPTER,
};

export default function GalaxyConnections({ variant }) {
  const materialRef = useRef();
  const actIndex = actIndexByVariant[variant];

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(segmentsByVariant[variant], 3));
    return geo;
  }, [variant]);

  useFrame(() => {
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const p = getActProgress(chapterIndex, chapterProgress, actIndex);
    if (materialRef.current) {
      materialRef.current.opacity = 0.22 * Math.min(p / 0.4, 1);
    }
  });

  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial
        ref={materialRef}
        // --accent-cyan (tokens.css): acento puntual para líneas de conexión
        // de datos, no el azul --primary ambiental que ya usa DigitalGrid —
        // así se leen como una capa de información distinta, no como más
        // "ruido" del mismo color de fondo.
        color="#22d3ee"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}
