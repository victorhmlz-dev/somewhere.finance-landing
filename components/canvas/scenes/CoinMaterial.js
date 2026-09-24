"use client";

import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

// Disco "moneda": geometría instanciada normal (rota de verdad en 3D, no
// billboard — así se ve de canto como una moneda real al girar, sin
// necesitar un cilindro biselado). El logo se compone sobre una base
// metálica neutra (uCoinColor) usando su propio alfa; un anillo de borde y
// un brillo puntual fijo simulan bisel/reflejo sin geometría ni luces
// reales — mismo espíritu que el halo de OrbitalMaterial.js.
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 mvPosition = instanceMatrix * vec4(position, 1.0);
    mvPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uCoinColor;
  uniform float uOpacity;

  varying vec2 vUv;

  void main() {
    vec2 p = vUv - 0.5;
    float d = length(p) * 2.0;
    if (d > 1.0) discard;

    vec4 tex = texture2D(uMap, vUv);

    vec3 base = uCoinColor;
    // Borde biselado: anillo brillante cerca del límite del disco.
    float rim = smoothstep(0.72, 0.88, d) * (1.0 - smoothstep(0.9, 1.0, d));
    base += rim * 0.4;
    // Reflejo puntual fijo (esquina superior-izquierda del disco).
    float glint = smoothstep(0.24, 0.0, length(p - vec2(-0.28, 0.3)));
    base += glint * 0.45;

    vec3 color = mix(base, tex.rgb, tex.a);
    gl_FragColor = vec4(color, uOpacity);
  }
`;

const CoinMaterial = shaderMaterial(
  {
    uMap: null,
    uCoinColor: new THREE.Color("#343444"),
    uOpacity: 0,
  },
  vertexShader,
  fragmentShader
);

extend({ CoinMaterial });

export default CoinMaterial;
