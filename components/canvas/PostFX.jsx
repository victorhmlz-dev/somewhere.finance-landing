"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  ChromaticAberration,
  ToneMapping,
  BrightnessContrast,
  HueSaturation,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { getCinematicPeak } from "@/lib/scroll/peakMoments";
import { POSTFX, BIGBANG, SINGULARITY, CINEMATIC, isMobile } from "@/lib/tuning";

// Bloom real (@react-three/postprocessing 3.1.1, peer deps: three >=0.156 ✓
// (0.186), @react-three/fiber >=9.7.0 ✓ (9.7.0), react ^19.0 ✓). Umbral alto
// a propósito: el bloom se reserva para picos reales (flash, shockwave), no
// para un resplandor ambiental constante. Aberración cromática: efecto de
// una sola pasada (offset RGB), barato según la documentación de
// react-postprocessing; se omite en móvil por presupuesto y solo dura el
// instante del flash.
export default function PostFX() {
  const caRef = useRef();
  const vignetteRef = useRef();
  const bloomRef = useRef();
  const contrastRef = useRef();
  const hueSatRef = useRef();
  const noiseRef = useRef();

  useFrame(() => {
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const p1 = getActProgress(chapterIndex, chapterProgress, 0);
    const p2 = getActProgress(chapterIndex, chapterProgress, 1);

    if (caRef.current && BIGBANG.chromaticAberration.enabled) {
      // Solo en el Big Bang: la aberración cromática es parte de ESA
      // explosión concreta, no un efecto genérico de "pico cinematográfico".
      const peak = chapterIndex === 1 ? getCinematicPeak(chapterIndex, chapterProgress) : 0;
      const decayGate = 1 - Math.min(Math.max(p2 / BIGBANG.chromaticAberration.decayEnd, 0), 1);
      const amount = peak * decayGate * BIGBANG.chromaticAberration.peakOffset;
      caRef.current.offset.set(amount, amount * 0.4);
    }

    if (vignetteRef.current) {
      // La viñeta se cierra un poco durante la "inhalación" final del acto 1.
      const inhale = Math.max(0, (p1 - SINGULARITY.inhaleStart) / (1 - SINGULARITY.inhaleStart));
      vignetteRef.current.darkness = POSTFX.vignette.darkness + inhale * SINGULARITY.inhaleVignetteBoost;
    }

    if (bloomRef.current) {
      // Releído cada frame (no solo al montar) para que DevTuning pueda
      // cambiarlo en vivo sin recargar.
      bloomRef.current.intensity = POSTFX.bloom.intensity;
      bloomRef.current.luminanceMaterial.threshold = POSTFX.bloom.luminanceThreshold;
      bloomRef.current.luminanceMaterial.smoothing = POSTFX.bloom.luminanceSmoothing;
    }

    if (contrastRef.current) {
      contrastRef.current.contrast = CINEMATIC.grade.contrast;
      contrastRef.current.brightness = CINEMATIC.grade.brightness;
    }
    if (hueSatRef.current) {
      hueSatRef.current.saturation = CINEMATIC.grade.saturation;
    }

    if (noiseRef.current) {
      noiseRef.current.blendMode.setOpacity(
        CINEMATIC.grainByChapter[chapterIndex] ?? POSTFX.noise.opacity
      );
    }
  });

  return (
    <EffectComposer multisampling={isMobile ? 0 : 4}>
      <Bloom
        ref={bloomRef}
        mipmapBlur={POSTFX.bloom.mipmapBlur}
        intensity={POSTFX.bloom.intensity}
        luminanceThreshold={POSTFX.bloom.luminanceThreshold}
        luminanceSmoothing={POSTFX.bloom.luminanceSmoothing}
        radius={POSTFX.bloom.radius}
      />
      <ChromaticAberration
        ref={caRef}
        offset={[0, 0]}
        blendFunction={BlendFunction.NORMAL}
        enabled={BIGBANG.chromaticAberration.enabled}
      />
      {CINEMATIC.grade.enabled && (
        <>
          <BrightnessContrast
            ref={contrastRef}
            brightness={CINEMATIC.grade.brightness}
            contrast={CINEMATIC.grade.contrast}
          />
          <HueSaturation ref={hueSatRef} saturation={CINEMATIC.grade.saturation} />
        </>
      )}
      {/* ACESFilmic es el modo por defecto de ToneMappingEffect: no hace
          falta pasar `mode`. Barato (una pasada), se mantiene en móvil. */}
      <ToneMapping />
      <Vignette
        ref={vignetteRef}
        eskil={false}
        offset={POSTFX.vignette.offset}
        darkness={POSTFX.vignette.darkness}
        blendFunction={BlendFunction.NORMAL}
      />
      <Noise
        ref={noiseRef}
        opacity={CINEMATIC.grainByChapter[0]}
        blendFunction={BlendFunction.OVERLAY}
      />
    </EffectComposer>
  );
}
