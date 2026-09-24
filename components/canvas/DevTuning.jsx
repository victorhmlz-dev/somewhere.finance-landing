"use client";

import { useEffect } from "react";
import { useControls } from "leva";
import { POSTFX, SINGULARITY, BIGBANG } from "@/lib/tuning";

// Panel de ajuste SOLO de desarrollo (leva, ~pocas decenas de KB, nunca se
// importa en producción — ver ExperienceLoader.jsx). Justificación: afinar
// bloom/cámara/inhalación a ojo, en vivo, es mucho más rápido que editar
// lib/tuning.js y esperar el hot-reload en cada iteración.
//
// Solo cubre los valores que los componentes releen cada frame (uniforms
// del shader, props de postprocesado vía ref, parámetros de cámara): la
// densidad de partículas y el reparto de capas están "horneados" en los
// buffers al montar y necesitan editar lib/tuning.js + recargar la página.
export default function DevTuning() {
  const bloom = useControls("Bloom", {
    intensity: { value: POSTFX.bloom.intensity, min: 0, max: 2, step: 0.05 },
    threshold: { value: POSTFX.bloom.luminanceThreshold, min: 0, max: 1, step: 0.01 },
  });

  const vignette = useControls("Viñeta", {
    darkness: { value: POSTFX.vignette.darkness, min: 0, max: 1.5, step: 0.05 },
  });

  const singularity = useControls("Singularity", {
    growthPower: { value: SINGULARITY.growthPower, min: 0.5, max: 4, step: 0.1 },
    inhaleStart: { value: SINGULARITY.inhaleStart, min: 0.5, max: 0.98, step: 0.01 },
    inhaleStrength: { value: SINGULARITY.inhaleStrength, min: 0, max: 1, step: 0.05 },
  });

  const bigbang = useControls("Big Bang", {
    easePower: { value: BIGBANG.easePower, min: 1, max: 6, step: 0.1 },
    shakeMagnitude: { value: BIGBANG.cameraShake.magnitude, min: 0, max: 0.6, step: 0.01 },
  });

  useEffect(() => {
    POSTFX.bloom.intensity = bloom.intensity;
    POSTFX.bloom.luminanceThreshold = bloom.threshold;
  }, [bloom]);

  useEffect(() => {
    POSTFX.vignette.darkness = vignette.darkness;
  }, [vignette]);

  useEffect(() => {
    SINGULARITY.growthPower = singularity.growthPower;
    SINGULARITY.inhaleStart = singularity.inhaleStart;
    SINGULARITY.inhaleStrength = singularity.inhaleStrength;
  }, [singularity]);

  useEffect(() => {
    BIGBANG.easePower = bigbang.easePower;
    BIGBANG.cameraShake.magnitude = bigbang.shakeMagnitude;
  }, [bigbang]);

  return null;
}
