"use client";

import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

// Rim-light / fresnel clásico: el borde de la esfera brilla, el centro queda
// transparente — así se lee como una cáscara de onda expansiva, no una bola.
const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uPower;

  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float fresnel = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0), uPower);
    gl_FragColor = vec4(uColor, fresnel * uOpacity);
  }
`;

const ShockwaveMaterial = shaderMaterial(
  {
    uColor: new THREE.Color("#ffffff"),
    uOpacity: 1,
    uPower: 3.4,
  },
  vertexShader,
  fragmentShader
);

extend({ ShockwaveMaterial });

export default ShockwaveMaterial;
