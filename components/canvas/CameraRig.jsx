"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { cameraBridge } from "@/lib/scroll/cameraBridge";
import { CAMERA, SINGULARITY, BIGBANG, NEBULA_ENTRY } from "@/lib/tuning";

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

// Coreografía de cámara de los 5 capítulos activos (restructuración: "nffc"
// en adelante se archivó, ver docs/ARCHIVED_NFFC_ACT.md — la cascada de
// actos 6-13 que existía aquí vive ahora como referencia en
// components/archive/act-ii-nffc/CameraRig.13ch.snapshot.jsx). Lee el store
// vanilla directamente en cada frame (getState()); nunca toca estado de
// React. Deriva de mano, roll y sacudida son offsets aditivos sobre la
// posición/FOV "base" que calculan las curvas de easing — así los cortes
// entre capítulos siguen siendo continuos (cada acto empieza donde termina
// el anterior, ver lib/tuning.js).
export default function CameraRig() {
  const smoothZ = useRef(CAMERA.singularity.zFrom);
  const smoothFov = useRef(CAMERA.singularity.fovFrom);
  const smoothOrbit = useRef(0);
  const smoothRoll = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const smoothPointer = useRef({ x: 0, y: 0 });
  const reducedMotion = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = media.matches;
    const onChange = (e) => {
      reducedMotion.current = e.matches;
    };
    media.addEventListener("change", onChange);

    const onPointerMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove);

    return () => {
      media.removeEventListener("change", onChange);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  useFrame(({ camera, clock }) => {
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const p1 = getActProgress(chapterIndex, chapterProgress, 0);
    const p2 = getActProgress(chapterIndex, chapterProgress, 1);
    const p3 = getActProgress(chapterIndex, chapterProgress, 2);
    const p4 = getActProgress(chapterIndex, chapterProgress, 3);
    const p5 = getActProgress(chapterIndex, chapterProgress, 4);
    const t = clock.elapsedTime;

    // --- Acto 1: dolly lento con ease-in (arranca casi quieto). ---
    const s = CAMERA.singularity;
    const t1 = Math.pow(p1, s.ease);
    const inhale = clamp01((p1 - SINGULARITY.inhaleStart) / (1 - SINGULARITY.inhaleStart));
    let z = lerp(s.zFrom, s.zTo, t1);
    let fov = lerp(s.fovFrom, s.fovTo, t1) - inhale * SINGULARITY.inhaleFovShrink;

    // --- Acto 2: retroceso con ease-out fuerte tras el flash. ---
    if (chapterIndex >= 1) {
      const b = CAMERA.bigbang;
      const t2 = 1 - Math.pow(1 - p2, b.ease);
      z = lerp(b.zFrom, b.zTo, t2);
      fov = lerp(b.fovFrom, b.fovTo, t2);
    }

    // --- Acto 3: asentamiento con órbita leve. ---
    if (chapterIndex >= 2) {
      const n = CAMERA.nebula;
      const t3 = p3 * p3 * (3 - 2 * p3); // smoothstep: ease-in-out
      z = lerp(n.zFrom, n.zTo, t3);
      fov = lerp(n.fovFrom, n.fovTo, t3);

      // Transición 02→03: "lurch" de FOV al entrar — pico gaussiano breve,
      // nunca con prefers-reduced-motion (ver WarpStreaks.jsx para el
      // acompañamiento visual del mismo pico).
      if (chapterIndex === 2 && !reducedMotion.current) {
        const punch = Math.exp(-Math.pow(p3 / NEBULA_ENTRY.sigma, 2));
        fov += punch * NEBULA_ENTRY.fovPunch;
      }
    }

    // --- Acto 4 ("The Galaxies & Chains"): acercamiento a los dos cúmulos +
    // hub (bache superpuesto a mitad de capítulo) y retroceso progresivo. ---
    if (chapterIndex >= 3) {
      const gc = CAMERA.galaxiesChains;
      const t4 = Math.pow(p4, gc.ease);
      z = lerp(gc.zFrom, gc.zTo, t4) - gc.approachDepth * Math.sin(p4 * Math.PI);
      fov = lerp(gc.fovFrom, gc.fovTo, t4);
    }

    // --- Acto 5 ("The Universe"): retroceso final con campo amplio. La
    // cámara se queda en su valor final durante el cierre del capítulo (la
    // convergencia de las galaxias, ver UNIVERSE_ENDING) — no hace falta un
    // bloque extra aquí, t5 ya satura en 1 y z/fov se quedan en zTo/fovTo. ---
    if (chapterIndex >= 4) {
      const u = CAMERA.universe;
      const t5 = p5 * p5 * (3 - 2 * p5);
      z = lerp(u.zFrom, u.zTo, t5);
      fov = lerp(u.fovFrom, u.fovTo, t5);
    }

    smoothZ.current += (z - smoothZ.current) * CAMERA.smoothing;
    smoothFov.current += (fov - smoothFov.current) * CAMERA.smoothing;

    // Deriva tipo cámara en mano durante la Singularity (se apaga cuando
    // arranca el Big Bang: p2 pasa a mandar ahí).
    const handheldGate = chapterIndex === 0 ? 1 : 0; // solo durante el acto 1
    let offsetX = 0;
    let offsetY = 0;
    if (!reducedMotion.current && handheldGate > 0) {
      const h = CAMERA.handheld;
      offsetX = Math.sin(t * h.frequencyX) * h.amplitude * handheldGate;
      offsetY = Math.cos(t * h.frequencyY * 1.3) * h.amplitude * 0.7 * handheldGate;
    }

    // Sacudida de cámara en el pico del Big Bang, desactivada con
    // prefers-reduced-motion.
    let shakeX = 0;
    let shakeY = 0;
    if (!reducedMotion.current && chapterIndex >= 1) {
      const sh = BIGBANG.cameraShake;
      const decay = Math.max(0, 1 - p2 / sh.decayEnd);
      const mag = sh.magnitude * decay * decay;
      shakeX = Math.sin(t * sh.frequency * 1.3) * mag;
      shakeY = Math.cos(t * sh.frequency) * mag * 0.8;
    }

    // Roll leve durante la explosión, vuelve a nivelarse hacia el final.
    let rollTarget = 0;
    if (chapterIndex === 1) rollTarget = Math.sin(clamp01(p2) * Math.PI) * CAMERA.bigbang.rollMax;
    smoothRoll.current += (rollTarget - smoothRoll.current) * 0.1;

    // Parallax suave con el puntero (0 en móvil, ver tuning.js).
    smoothPointer.current.x += (pointer.current.x - smoothPointer.current.x) * 0.05;
    smoothPointer.current.y += (pointer.current.y - smoothPointer.current.y) * 0.05;
    const parallaxX = smoothPointer.current.x * CAMERA.pointerParallax;
    const parallaxY = smoothPointer.current.y * CAMERA.pointerParallax * 0.6;

    let orbitTarget = 0;
    // Acto 2: ángulo leve durante la explosión.
    if (chapterIndex === 1) orbitTarget = p2 * CAMERA.bigbang.orbitMax;
    else if (chapterIndex === 2) orbitTarget = p3 * CAMERA.nebula.orbitMax;
    // Acto 4: sostiene el ángulo alcanzado en la Nebula.
    else if (chapterIndex === 3) orbitTarget = CAMERA.nebula.orbitMax;
    // Acto 5: sigue abriendo el ángulo hasta orbitMax propio, y lo sostiene
    // durante el cierre del capítulo (nada lo reduce después: es el final).
    else if (chapterIndex === 4) orbitTarget = CAMERA.nebula.orbitMax + p5 * CAMERA.universe.orbitMax;
    smoothOrbit.current += (orbitTarget - smoothOrbit.current) * 0.08;

    camera.position.x =
      Math.sin(smoothOrbit.current) * smoothZ.current * 0.12 + offsetX + shakeX + parallaxX;
    camera.position.y = offsetY + shakeY + parallaxY;
    camera.position.z = smoothZ.current;
    camera.fov = smoothFov.current;
    camera.updateProjectionMatrix();
    camera.up.set(Math.sin(smoothRoll.current), Math.cos(smoothRoll.current), 0);
    camera.lookAt(0, 0, 0);

    // Publica la matriz vista-proyección para que el DOM (etiquetas de
    // chains/empresas/hub) pueda proyectar posiciones 3D a píxeles sin
    // acoplarse a r3f.
    camera.updateMatrixWorld();
    cameraBridge.viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    cameraBridge.ready = true;
  });

  return null;
}
