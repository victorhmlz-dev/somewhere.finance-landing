"use client";

import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

// Streak anamórfico procedural: una línea horizontal fina con caída
// gaussiana (sin caja/borde duro) más un núcleo redondeado sutil en el
// centro. Deliberadamente NO usamos el efecto `LensFlare` de
// @react-three/postprocessing: ese componente pilota su propia opacidad
// cada frame vía un raycast de oclusión (pensado para un sol 3D real),
// que compite con cualquier valor externo que le asignemos y no se puede
// atar de forma fiable al pico del flash del Big Bang. Un shader propio,
// del mismo tipo que ya usa Shockwave/Flash, da control total y barato
// (un solo quad).
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uHorizontalFalloff;
  uniform float uVerticalFalloff;

  varying vec2 vUv;

  void main() {
    vec2 p = vUv - 0.5;
    float streak = exp(-pow(p.x * uHorizontalFalloff, 2.0)) * exp(-pow(p.y * uVerticalFalloff, 2.0));
    float core = exp(-pow(length(p) * 9.0, 2.0)) * 0.5;
    float intensity = (streak + core) * uOpacity;
    gl_FragColor = vec4(uColor * intensity, intensity);
  }
`;

const LensStreakMaterial = shaderMaterial(
  {
    uColor: new THREE.Color("#c9d4ff"),
    uOpacity: 0,
    uHorizontalFalloff: 3.2,
    uVerticalFalloff: 55,
  },
  vertexShader,
  fragmentShader
);

extend({ LensStreakMaterial });

export default LensStreakMaterial;
