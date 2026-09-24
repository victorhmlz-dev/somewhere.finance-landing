"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { cameraBridge } from "@/lib/scroll/cameraBridge";
import { CAMERA, SINGULARITY, BIGBANG, NEBULA_ENTRY } from "@/lib/tuning";

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

// Coreografía de cámara de los actos 1-3. Lee el store vanilla directamente
// en cada frame (getState()); nunca toca estado de React. Deriva de mano,
// roll y sacudida son offsets aditivos sobre la posición/FOV "base" que
// calculan las curvas de easing — así los cortes entre capítulos siguen
// siendo continuos (ver lib/tuning.js: los z/fov de un acto empiezan donde
// termina el anterior).
//
// Ronda de revisión creativa del Acto I, punto 7: "the-galaxies" y
// "the-chains" (antes actos 3 y 4) se fusionan en un único acto 3
// ("galaxiesChains" en CAMERA) — todo lo posterior se renumera -1 (13
// capítulos en vez de 14). p1..p13 sustituyen a los p1..p14 anteriores.
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
    const p6 = getActProgress(chapterIndex, chapterProgress, 5);
    const p7 = getActProgress(chapterIndex, chapterProgress, 6);
    const p8 = getActProgress(chapterIndex, chapterProgress, 7);
    const p9 = getActProgress(chapterIndex, chapterProgress, 8);
    const p10 = getActProgress(chapterIndex, chapterProgress, 9);
    const p11 = getActProgress(chapterIndex, chapterProgress, 10);
    const p12 = getActProgress(chapterIndex, chapterProgress, 11);
    const p13 = getActProgress(chapterIndex, chapterProgress, 12);
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

    // --- Acto 4 (capítulo fusionado Galaxies+Chains): acercamiento a la
    // galaxia y a las siete chains (bache superpuesto a mitad de capítulo) —
    // cámara mucho más cerca que la suma de los dos actos que sustituye. ---
    if (chapterIndex >= 3) {
      const gc = CAMERA.galaxiesChains;
      const t4 = Math.pow(p4, gc.ease);
      z = lerp(gc.zFrom, gc.zTo, t4) - gc.approachDepth * Math.sin(p4 * Math.PI);
      fov = lerp(gc.fovFrom, gc.fovTo, t4);
    }

    // --- Acto 5: retroceso final con campo amplio. ---
    if (chapterIndex >= 4) {
      const u = CAMERA.universe;
      const t5 = p5 * p5 * (3 - 2 * p5);
      z = lerp(u.zFrom, u.zTo, t5);
      fov = lerp(u.fovFrom, u.fovTo, t5);
    }

    // --- Acto 6 (NFFC): zoom hacia la galaxia hero — deja de retroceder y
    // empieza a acercarse, ease-out fuerte como el propio Big Bang. ---
    if (chapterIndex >= 5) {
      const n6 = CAMERA.nffc;
      const t6 = 1 - Math.pow(1 - p6, n6.ease);
      z = lerp(n6.zFrom, n6.zTo, t6);
      fov = lerp(n6.fovFrom, n6.fovTo, t6);
    }

    // --- Acto 7 (The Index): casi estable, deja ver las reconfiguraciones. ---
    if (chapterIndex >= 6) {
      const idx7 = CAMERA.theIndex;
      const t7 = p7 * p7 * (3 - 2 * p7);
      z = lerp(idx7.zFrom, idx7.zTo, t7);
      fov = lerp(idx7.fovFrom, idx7.fovTo, t7);
    }

    // --- Acto 8 (Non-Fungible): retrocede un poco, deja aire a la ficha DOM. ---
    if (chapterIndex >= 7) {
      const nf = CAMERA.nonFungible;
      const t8 = p8 * p8 * (3 - 2 * p8);
      z = lerp(nf.zFrom, nf.zTo, t8);
      fov = lerp(nf.fovFrom, nf.fovTo, t8);
    }

    // --- Acto 9 (Digital DNA): "segundo Big Bang" — acercamiento con bache
    // superpuesto (como el acto 4) y apertura de FOV al formarse la hélice. ---
    if (chapterIndex >= 8) {
      const dna = CAMERA.digitalDna;
      const t9 = Math.pow(p9, dna.ease);
      z = lerp(dna.zFrom, dna.zTo, t9) - dna.approachDepth * Math.sin(p9 * Math.PI);
      fov = lerp(dna.fovFrom, dna.fovTo, t9);
    }

    // --- Acto 10 (The Market Moves): vuelve de la hélice a la órbita, con
    // un vaivén sutil que acompaña los pulsos de actividad. ---
    if (chapterIndex >= 9) {
      const mm = CAMERA.marketMoves;
      const t10 = Math.pow(p10, mm.ease);
      z = lerp(mm.zFrom, mm.zTo, t10) - mm.approachDepth * Math.sin(p10 * Math.PI);
      fov = lerp(mm.fovFrom, mm.fovTo, t10);
    }

    // --- Acto 11 (Your Universe): casi estable. ---
    if (chapterIndex >= 10) {
      const yu = CAMERA.yourUniverse;
      const t11 = p11 * p11 * (3 - 2 * p11);
      z = lerp(yu.zFrom, yu.zTo, t11);
      fov = lerp(yu.fovFrom, yu.fovTo, t11);
    }

    // --- Acto 12 (One Universe): retroceso hasta la vista más amplia de
    // toda la pieza. ---
    if (chapterIndex >= 11) {
      const ou = CAMERA.oneUniverse;
      const t12 = p12 * p12 * (3 - 2 * p12);
      z = lerp(ou.zFrom, ou.zTo, t12);
      fov = lerp(ou.fovFrom, ou.fovTo, t12);
    }

    // --- Acto 13 (Final): rebobina hasta el encuadre exacto del acto 1. ---
    if (chapterIndex >= 12) {
      const f = CAMERA.final;
      const t13 = 1 - Math.pow(1 - p13, f.ease);
      z = lerp(f.zFrom, f.zTo, t13);
      fov = lerp(f.fovFrom, f.fovTo, t13);
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

    // Roll leve durante la explosión (y su eco en el acto 9, el "segundo Big
    // Bang"), vuelve a nivelarse hacia el final de cada uno.
    let rollTarget = 0;
    if (chapterIndex === 1) rollTarget = Math.sin(clamp01(p2) * Math.PI) * CAMERA.bigbang.rollMax;
    else if (chapterIndex === 8) rollTarget = Math.sin(clamp01(p9) * Math.PI) * CAMERA.digitalDna.rollMax;
    smoothRoll.current += (rollTarget - smoothRoll.current) * 0.1;

    // Parallax suave con el puntero (0 en móvil, ver tuning.js).
    smoothPointer.current.x += (pointer.current.x - smoothPointer.current.x) * 0.05;
    smoothPointer.current.y += (pointer.current.y - smoothPointer.current.y) * 0.05;
    const parallaxX = smoothPointer.current.x * CAMERA.pointerParallax;
    const parallaxY = smoothPointer.current.y * CAMERA.pointerParallax * 0.6;

    let orbitTarget = 0;
    // Acto 2: ángulo leve durante la explosión (ronda de revisión creativa
    // del Acto I) — antes la cámara no giraba nada durante el Big Bang.
    if (chapterIndex === 1) orbitTarget = p2 * CAMERA.bigbang.orbitMax;
    else if (chapterIndex === 2) orbitTarget = p3 * CAMERA.nebula.orbitMax;
    // Acto 3 (capítulo fusionado Galaxies+Chains): sostiene el ángulo
    // alcanzado en la Nebula — antes esto eran dos actos separados (3 y 4)
    // con la misma órbita sostenida; ahora es uno solo.
    else if (chapterIndex === 3) orbitTarget = CAMERA.nebula.orbitMax;
    else if (chapterIndex === 4) orbitTarget = CAMERA.nebula.orbitMax + p5 * CAMERA.universe.orbitMax;
    else if (chapterIndex === 5) {
      // Acto 6: la órbita acumulada de los actos 3-5 se reduce a la vez que
      // la cámara hace zoom hacia la galaxia — un ángulo muy abierto no
      // encaja con un acercamiento directo.
      const heldOrbit = CAMERA.nebula.orbitMax + CAMERA.universe.orbitMax;
      orbitTarget = heldOrbit * (1 - p6);
    } else if (chapterIndex === 6) orbitTarget = p7 * CAMERA.theIndex.orbitMax;
    else if (chapterIndex >= 7 && chapterIndex <= 10) orbitTarget = CAMERA.theIndex.orbitMax;
    else if (chapterIndex === 11) orbitTarget = CAMERA.theIndex.orbitMax + p12 * CAMERA.oneUniverse.orbitMax;
    else if (chapterIndex === 12) {
      // Acto 13: quietud contemplativa — la órbita vuelve a 0 a la vez que
      // la cámara rebobina hacia el encuadre inicial del acto 1.
      const heldOrbit = CAMERA.theIndex.orbitMax + CAMERA.oneUniverse.orbitMax;
      orbitTarget = heldOrbit * (1 - p13);
    }
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
    // chains) pueda proyectar posiciones 3D a píxeles sin acoplarse a r3f.
    camera.updateMatrixWorld();
    cameraBridge.viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    cameraBridge.ready = true;
  });

  return null;
}
