"use client";

import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

// Nodo orbital: mismo billboard en espacio de vista que BillboardGalaxyMaterial
// (quad instanciado, siempre de cara a cámara, sin depender de la rotación
// de la instancia) con el mismo halo suave que GalaxyMaterial en vez de la
// espiral pintada — aquí cada instancia es un activo/nodo, no una galaxia
// entera. Las posiciones de cada instancia (órbita, hélice) se calculan en
// JS y se escriben en instanceMatrix cada frame (mismo patrón que
// Fragments.jsx), no en el shader: así una sola instancia de este material
// sirve para los capítulos 07-10 sin tener que codificar la interpolación
// entre configuraciones dentro del GLSL.
const vertexShader = /* glsl */ `
  attribute float aColorMix;

  varying vec2 vUv;
  varying float vColorMix;

  void main() {
    vUv = uv;
    vColorMix = aColorMix;

    vec4 worldPos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vec4 mvPosition = modelViewMatrix * worldPos;
    vec2 scale = vec2(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz));
    mvPosition.xy += position.xy * scale;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorWhite;
  uniform vec3 uColorPrimary;
  uniform vec3 uColorAccent;
  uniform vec3 uColorBurst;
  uniform float uOpacity;
  uniform float uBurstAmount;

  varying vec2 vUv;
  varying float vColorMix;

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float d = length(p);
    if (d > 1.0) discard;

    float halo = pow(smoothstep(1.0, 0.0, d), 1.8);
    float core = smoothstep(0.35, 0.0, d);

    vec3 color = mix(uColorWhite, uColorPrimary, clamp(vColorMix * 2.0, 0.0, 1.0));
    color = mix(color, uColorAccent, clamp(vColorMix * 2.0 - 1.0, 0.0, 1.0));
    color = mix(color, uColorWhite, core * 0.8);
    // Acento --accent-green puntual: solo durante los picos de actividad del
    // capítulo 11 (uBurstAmount, ver NffcSystem.jsx) — 0 el resto del
    // tiempo, así que en cualquier otro capítulo este mix no hace nada.
    color = mix(color, uColorBurst, uBurstAmount * 0.85);

    float alpha = halo * uOpacity;
    if (alpha < 0.015) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

const OrbitalMaterial = shaderMaterial(
  {
    uOpacity: 1,
    uBurstAmount: 0,
    uColorWhite: new THREE.Color("#ffffff"),
    uColorPrimary: new THREE.Color("#5142fc"),
    uColorAccent: new THREE.Color("#af50e5"),
    uColorBurst: new THREE.Color("#22c55e"),
  },
  vertexShader,
  fragmentShader
);

extend({ OrbitalMaterial });

export default OrbitalMaterial;
