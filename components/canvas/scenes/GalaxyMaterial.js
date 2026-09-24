"use client";

import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { noiseGLSL } from "@/lib/shaders/noise";
import { galaxyGLSL } from "@/lib/shaders/galaxy";

// Material genérico de galaxia procedural: lo reutilizan las colecciones del
// capítulo 04, las chains del 05 y las galaxias cercanas del LOD del 06 —
// mismo shader, distintos uniforms/atributos por instancia de uso. También
// es el objetivo de mezcla final del acto 4 en UniverseParticleMaterial
// (misma fórmula de posición, para que la transición nebulosa->galaxia use
// literalmente las mismas matemáticas).
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress; // 0-1: aparición/revelado de la galaxia
  uniform float uArmCount;
  uniform float uTightness;
  uniform float uRadius;
  uniform float uThickness;
  uniform float uNoiseAmount;
  uniform float uRotationSpeed;
  uniform float uCoreSize;
  uniform float uPixelRatio;
  uniform float uSizeScale;
  uniform float uFogNear;
  uniform float uFogFar;

  attribute float aRadiusSeed;
  attribute float aArmIndex;
  attribute float aAngleJitter;
  attribute float aHeightSeed;
  attribute float aSeed;
  attribute float aBaseSize;
  attribute float aColorMix;

  varying float vColorMix;
  varying float vAlpha;
  varying float vFog;
  varying float vCore;

  ${noiseGLSL}
  ${galaxyGLSL}

  void main() {
    vec3 pos = galaxyPosition(
      aRadiusSeed, aArmIndex, aAngleJitter, aHeightSeed,
      uArmCount, uTightness, uRadius, uThickness, uNoiseAmount, uRotationSpeed, uTime
    );

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float reveal = smoothstep(aSeed - 0.08, aSeed + 0.08, uProgress);
    // smoothstep(edge0, edge1, x) es indefinido si edge0 > edge1 — se
    // escribe con bordes ascendentes e invertido a mano.
    float core = 1.0 - smoothstep(0.0, uCoreSize, aRadiusSeed);
    float sizeBoost = 1.0 + core * 0.9;

    gl_PointSize = aBaseSize * uSizeScale * sizeBoost * uPixelRatio * (300.0 / -mvPosition.z);

    vColorMix = aColorMix;
    vAlpha = reveal;
    vCore = core;
    vFog = clamp((-mvPosition.z - uFogNear) / max(uFogFar - uFogNear, 0.001), 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorWhite;
  uniform vec3 uColorPrimary;
  uniform vec3 uColorAccent;
  uniform float uOpacity;

  varying float vColorMix;
  varying float vAlpha;
  varying float vFog;
  varying float vCore;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv) * 2.0;
    float halo = smoothstep(1.0, 0.0, d);
    halo = pow(halo, 1.8);

    vec3 color = mix(uColorWhite, uColorPrimary, clamp(vColorMix * 2.0, 0.0, 1.0));
    color = mix(color, uColorAccent, clamp(vColorMix * 2.0 - 1.0, 0.0, 1.0));
    color = mix(color, uColorWhite, vCore * 0.8);

    float alpha = halo * uOpacity * vAlpha * (1.0 - vFog * 0.85);
    if (alpha < 0.015) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

const GalaxyMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 1,
    uArmCount: 4,
    uTightness: 3,
    uRadius: 3,
    uThickness: 0.15,
    uNoiseAmount: 0.1,
    uRotationSpeed: 0.08,
    uCoreSize: 0.2,
    uPixelRatio: 1,
    uSizeScale: 1,
    uFogNear: 8,
    uFogFar: 40,
    uOpacity: 1,
    uColorWhite: new THREE.Color("#ffffff"),
    uColorPrimary: new THREE.Color("#5142fc"),
    uColorAccent: new THREE.Color("#16efff"),
  },
  vertexShader,
  fragmentShader
);

extend({ GalaxyMaterial });

export default GalaxyMaterial;
