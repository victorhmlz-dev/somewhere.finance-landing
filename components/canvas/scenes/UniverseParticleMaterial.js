"use client";

import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { noiseGLSL } from "@/lib/shaders/noise";
import { galaxyGLSL } from "@/lib/shaders/galaxy";
import { SINGULARITY, BIGBANG, GALAXY_MORPH } from "@/lib/tuning";

// Una sola posición se construye por mezcla de tres objetivos (singularidad,
// big bang, nebula) según el acto activo. Todo el movimiento vive aquí, en
// el vertex shader, guiado por uniforms — el JS solo escribe esos uniforms
// una vez por frame, nunca toca partículas una a una. Los valores por
// defecto de los uniforms vienen de lib/tuning.js.
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress1;
  uniform float uProgress2;
  uniform float uProgress3;
  uniform float uProgress4;
  uniform float uProgress5;
  uniform float uGalaxyArmCount;
  uniform float uGalaxyTightness;
  uniform float uGalaxyRadius;
  uniform float uGalaxyThickness;
  uniform float uGalaxyNoiseAmount;
  uniform float uGalaxyRotationSpeed;
  uniform float uPixelRatio;
  uniform float uSizeScale;
  uniform float uRadiusScale;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uGrowthPower;
  uniform float uJitterBase;
  uniform float uJitterMax;
  uniform float uInhaleStart;
  uniform float uInhaleStrength;
  uniform float uEasePower;

  attribute vec3 aDirection;
  attribute float aSeed;
  attribute float aSpeed;
  attribute float aBaseSize;
  attribute float aColorMix;
  attribute vec3 aNebulaBase;
  attribute float aRadiusSeed;
  attribute float aArmIndex;
  attribute float aAngleJitter;
  attribute float aHeightSeed;

  varying float vColorMix;
  varying float vAlpha;
  varying float vFog;

  ${noiseGLSL}
  ${galaxyGLSL}

  void main() {
    // Acto 1 — Singularity: casi sin cambios al principio, la tensión se
    // acumula sobre todo en el último tramo (curva de potencia), no de forma
    // lineal. En el tramo final (inhale) se contrae hacia el centro en vez
    // de seguir creciendo: la "inhalación" antes del Big Bang.
    float p1Curve = pow(uProgress1, uGrowthPower);
    float jitterAmp = uJitterBase + p1Curve * uJitterMax;
    vec3 jitter = vec3(
      sin(uTime * 1.7 + aSeed * 62.0),
      cos(uTime * 1.3 + aSeed * 37.0),
      sin(uTime * 2.1 + aSeed * 91.0)
    ) * jitterAmp * (0.2 + 0.8 * aSeed);

    float inhale = smoothstep(uInhaleStart, 1.0, uProgress1);
    float spreadMul = mix(1.0, 1.0 - uInhaleStrength, inhale);
    vec3 singularityPos = jitter * mix(0.2, 1.0, aSeed) * spreadMul;

    // Acto 2 — Big Bang: explosión radial con ease-out fuerte + turbulencia.
    float easedP2 = 1.0 - pow(1.0 - uProgress2, uEasePower);
    float dist = easedP2 * (2.5 + aSpeed * 9.0) * uRadiusScale;
    vec3 bigBangPos = aDirection * dist;
    bigBangPos += curlNoise(aDirection * 1.5 + uTime * 0.05) * easedP2 * 0.6;

    // Acto 3 — Nebula: campo de flujo (curl noise) alrededor de un centro de nube.
    vec3 flowInput = aNebulaBase * 0.35 + uTime * 0.03;
    vec3 nebulaPos = aNebulaBase + curlNoise(flowInput) * 1.8;

    // Acto 4 — Galaxies: la nebulosa colapsa en una galaxia espiral. Misma
    // función que usan las colecciones/chains/LOD (lib/shaders/galaxy.js),
    // para que la transición 03->04 sea literalmente las mismas partículas
    // adoptando la misma matemática de forma, sin corte visible.
    vec3 galaxyPos = galaxyPosition(
      aRadiusSeed, aArmIndex, aAngleJitter, aHeightSeed,
      uGalaxyArmCount, uGalaxyTightness, uGalaxyRadius * uRadiusScale, uGalaxyThickness,
      uGalaxyNoiseAmount, uGalaxyRotationSpeed, uTime
    );

    vec3 pos = singularityPos;
    pos = mix(pos, bigBangPos, smoothstep(0.0, 1.0, uProgress2));
    pos = mix(pos, nebulaPos, smoothstep(0.0, 1.0, uProgress3));
    pos = mix(pos, galaxyPos, smoothstep(0.0, 1.0, uProgress4));
    // Acto 14 — Final: todo colapsa de vuelta al punto. singularityPos no
    // es una forma nueva: es la MISMA fórmula del acto 1, reevaluada con
    // uProgress1 rebobinando en vivo de 1 a 0 (ver UniverseParticles.jsx) —
    // el círculo narrativo es real a nivel de estado, no solo un blend
    // hacia una forma que se parece a la inicial.
    pos = mix(pos, singularityPos, smoothstep(0.0, 1.0, uProgress5));

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Revelado progresivo por semilla, también retrasado (p1Curve): pocos
    // fragmentos sueltos durante casi todo el acto 1, más señales solo al
    // final. En cuanto arranca el Big Bang, todas las partículas son visibles.
    float reveal = smoothstep(aSeed - 0.06, aSeed + 0.06, p1Curve);
    reveal = mix(reveal, 1.0, smoothstep(0.0, 0.08, uProgress2));

    float sizePulse = 1.0 + 1.5 * uProgress2 * (1.0 - uProgress2);
    gl_PointSize = aBaseSize * uSizeScale * sizePulse * uPixelRatio * (300.0 / -mvPosition.z);

    vColorMix = aColorMix;
    vAlpha = reveal;
    vFog = clamp((-mvPosition.z - uFogNear) / max(uFogFar - uFogNear, 0.001), 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorWhite;
  uniform vec3 uColorPrimary;
  uniform vec3 uColorAccent;
  uniform float uOpacity;
  uniform float uFogIntensity;

  varying float vColorMix;
  varying float vAlpha;
  varying float vFog;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv) * 2.0;
    float halo = smoothstep(1.0, 0.0, d);
    halo = pow(halo, 1.8);

    vec3 color = mix(uColorWhite, uColorPrimary, clamp(vColorMix * 2.0, 0.0, 1.0));
    color = mix(color, uColorAccent, clamp(vColorMix * 2.0 - 1.0, 0.0, 1.0));

    // uFogIntensity (0.85 por defecto, más alto en la Singularity — ver
    // UniverseParticles.jsx): sigue siendo el mismo sistema de fade por
    // alfa de siempre (nunca THREE.Fog, que lava el aditivo — Fase 3a),
    // solo con más fuerza en el capítulo donde hace falta más profundidad.
    float alpha = halo * uOpacity * vAlpha * (1.0 - vFog * uFogIntensity);
    if (alpha < 0.015) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

const UniverseParticleMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress1: 0,
    uProgress2: 0,
    uProgress3: 0,
    uProgress4: 0,
    uProgress5: 0,
    uGalaxyArmCount: GALAXY_MORPH.armCount,
    uGalaxyTightness: GALAXY_MORPH.tightness,
    uGalaxyRadius: GALAXY_MORPH.radius,
    uGalaxyThickness: GALAXY_MORPH.thickness,
    uGalaxyNoiseAmount: GALAXY_MORPH.noiseAmount,
    uGalaxyRotationSpeed: GALAXY_MORPH.rotationSpeed,
    uPixelRatio: 1,
    uSizeScale: 2,
    uRadiusScale: 1,
    uFogNear: 4,
    uFogFar: 14,
    uFogIntensity: 0.85,
    uOpacity: 1,
    uGrowthPower: SINGULARITY.growthPower,
    uJitterBase: SINGULARITY.jitterBase,
    uJitterMax: SINGULARITY.jitterMax,
    uInhaleStart: SINGULARITY.inhaleStart,
    uInhaleStrength: SINGULARITY.inhaleStrength,
    uEasePower: BIGBANG.easePower,
    uColorWhite: new THREE.Color("#ffffff"),
    uColorPrimary: new THREE.Color("#5142fc"),
    uColorAccent: new THREE.Color("#af50e5"),
  },
  vertexShader,
  fragmentShader
);

extend({ UniverseParticleMaterial });

export default UniverseParticleMaterial;
