import * as THREE from "three";
import { getActProgress } from "@/lib/scroll/actProgress";
import { ECOSYSTEM_SCENE } from "@/lib/tuning";

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

// Geometría compartida de las órbitas de "The Galaxies & Chains": la usan
// los anillos del canvas (EcosystemOrbits.jsx) y los iconos del DOM
// (EcosystemNodes.jsx), para que un icono esté siempre exactamente sobre su
// anillo. Los anillos viven en el plano del disco de cada galaxia (XY local,
// ver lib/shaders/galaxy.js) orientado con su `groupRotation` — la misma
// inclinación que el disco. `driftSpeed` no se sigue aquí (todas las
// galaxias de este capítulo lo tienen a 0).

// Reveal/fade del capítulo: entra en el acto 4 y se apaga en el primer
// tramo de "the-universe" — mismo criterio que EcosystemField.
export function getEcosystemReveal(chapterIndex, chapterProgress) {
  const p4 = getActProgress(chapterIndex, chapterProgress, 3);
  const fadeIn = clamp01(p4 / ECOSYSTEM_SCENE.revealDuration);
  let fadeOut = 1;
  if (chapterIndex === 4) {
    fadeOut = 1 - clamp01(getActProgress(chapterIndex, chapterProgress, 4) / 0.3);
  } else if (chapterIndex > 4) {
    fadeOut = 0;
  }
  return fadeIn * fadeOut;
}

// Radio en mundo de cada anillo de una galaxia.
export function getRingRadius(galaxyConfig, ringIndex) {
  return galaxyConfig.radius * ECOSYSTEM_SCENE.orbits.radii[ringIndex];
}

// Reparto automático de los items entre anillos: alternos (0, 1, 0, 1…) y
// equiespaciados dentro de cada anillo; el segundo anillo va desfasado medio
// hueco para que los iconos de ambos no se alineen radialmente.
export function getOrbitSlot(index, count) {
  const ringCount = ECOSYSTEM_SCENE.orbits.radii.length;
  const ring = index % ringCount;
  const onRing = Math.ceil((count - ring) / ringCount);
  const k = Math.floor(index / ringCount);
  const step = (Math.PI * 2) / onRing;
  return { ring, phase: k * step + ring * step * 0.5 };
}

const euler = new THREE.Euler();
const quat = new THREE.Quaternion();
const tmp = new THREE.Vector3();

// Punto del anillo en coordenadas de mundo (escribe en `out`, sin crear
// objetos por frame).
export function getOrbitPoint(galaxyConfig, radius, angle, out) {
  const [rx, ry, rz] = galaxyConfig.groupRotation;
  quat.setFromEuler(euler.set(rx, ry, rz));
  tmp.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0).applyQuaternion(quat);
  out[0] = galaxyConfig.position[0] + tmp.x;
  out[1] = galaxyConfig.position[1] + tmp.y;
  out[2] = galaxyConfig.position[2] + tmp.z;
  return out;
}
