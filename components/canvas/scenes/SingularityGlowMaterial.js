"use client";

import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

// Un solo quad en el origen, orientado a cámara en el propio vertex shader
// (expande en espacio de vista, sin <Billboard>). Su radio se calcula con la
// MISMA fórmula que gl_PointSize de UniverseParticleMaterial
// (size * 300 / profundidad, en píxeles), convertida a unidades de mundo:
// la profundidad se cancela, así que basta con el alto del viewport y el
// término de proyección — el disco crece igual que crecían las partículas
// al acercarse la cámara.
const vertexShader = /* glsl */ `
  uniform float uSize;
  uniform float uSizeScale;
  uniform float uViewportHeight;

  varying vec2 vUv;

  void main() {
    vUv = position.xy; // -1..1
    // Diámetro en px = uSize * uSizeScale * 300 / z  →  radio en mundo.
    float radius = uSize * uSizeScale * 300.0 / (uViewportHeight * projectionMatrix[1][1]);
    vec4 mvPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mvPosition.xy += position.xy * radius;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Mismo perfil de halo que una partícula (smoothstep + pow 1.8), saturado
// con 1 - exp(-k·halo): emula la suma aditiva de cientos de partículas
// apiladas — núcleo blanco plano y borde suave teñido.
const fragmentShader = /* glsl */ `
  uniform vec3 uColorCore;
  uniform vec3 uColorEdge;
  uniform float uIntensity;
  uniform float uOpacity;
  uniform float uFogFade;

  varying vec2 vUv;

  void main() {
    float d = length(vUv);
    float halo = pow(smoothstep(1.0, 0.0, d), 1.8);
    // uFogFade: mismo fade por distancia que la capa hero de partículas
    // (ver SingularityGlow.jsx) — con la cámara lejos el disco saturado se
    // encoge, igual que antes.
    float a = 1.0 - exp(-uIntensity * uFogFade * halo);
    vec3 color = mix(uColorEdge, uColorCore, smoothstep(0.35, 0.95, a));
    float alpha = a * uOpacity;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

const SingularityGlowMaterial = shaderMaterial(
  {
    uSize: 16,
    uSizeScale: 1,
    uViewportHeight: 1,
    uIntensity: 7,
    uOpacity: 0,
    uFogFade: 1,
    uColorCore: new THREE.Color("#ffffff"),
    uColorEdge: new THREE.Color("#a49ee6"),
  },
  vertexShader,
  fragmentShader
);

extend({ SingularityGlowMaterial });

export default SingularityGlowMaterial;
