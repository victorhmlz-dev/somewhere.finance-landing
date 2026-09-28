"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { PARTICLES, SINGULARITY, isMobile } from "@/lib/tuning";
import "./SingularityGlowMaterial";

const smoothstep = (a, b, v) => {
  const t = Math.min(Math.max((v - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

// Cuánto "manda" la singularidad (0-1): 1 durante todo el acto 1, se libera
// en el arranque del Big Bang (SINGULARITY.glow.releaseStart/End). Lo
// comparten este brillo (su opacidad) y UniverseParticles (el límite de
// tamaño de punto), para que el relevo entre ambos sea exacto.
export function getSingularityHold(chapterIndex, chapterProgress) {
  if (chapterIndex === 0) return 1;
  if (chapterIndex === 1) {
    return 1 - smoothstep(SINGULARITY.glow.releaseStart, SINGULARITY.glow.releaseEnd, chapterProgress);
  }
  return 0;
}

// Esfera luminosa de la singularidad: antes era el resultado de apilar
// miles de partículas de cientos de píxeles en el centro (el mayor coste de
// GPU de toda la pieza, ver SINGULARITY.pointSizeCapPx). Ahora es un único
// quad con el mismo perfil de halo, saturado; las partículas, con su tamaño
// limitado, siguen aportando textura y movimiento encima.
export default function SingularityGlow() {
  const materialRef = useRef();
  const size = useThree((state) => state.size);

  useFrame(({ camera }) => {
    const mat = materialRef.current;
    if (!mat) return;
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const p1 = getActProgress(chapterIndex, chapterProgress, 0);
    // Misma curva de revelado que el vertex shader de las partículas.
    const p1Curve = Math.pow(p1, SINGULARITY.growthPower);
    const reveal = smoothstep(0, SINGULARITY.glow.revealEnd, p1Curve);

    mat.uOpacity = reveal * getSingularityHold(chapterIndex, chapterProgress);
    mat.uViewportHeight = size.height;
    mat.uSize = SINGULARITY.glow.size;
    // Al principio del acto solo hay unas pocas partículas reveladas y su
    // suma satura un disco más pequeño: la saturación crece con el revelado
    // (sqrt: la fracción revelada ≈ p1Curve, con retorno decreciente).
    mat.uIntensity = SINGULARITY.glow.intensity * Math.sqrt(p1Curve);
    // Fade por distancia de la capa hero (la que definía el borde de la
    // esfera): misma fórmula que vFog en UniverseParticleMaterial, con la
    // intensidad reforzada del acto 1.
    const { fogNear, fogFar } = PARTICLES.hero;
    const fog = Math.min(Math.max((camera.position.length() - fogNear) / (fogFar - fogNear), 0), 1);
    mat.uFogFade = 1 - fog * SINGULARITY.fogIntensity;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <singularityGlowMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uSizeScale={isMobile ? 0.85 : 1}
      />
    </mesh>
  );
}
