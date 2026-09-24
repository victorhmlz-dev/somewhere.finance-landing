"use client";

import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

// Galaxia "barata" para el campo lejano del LOD (cap. 06): un quad
// instanciado, siempre de cara a cámara (billboard en espacio de vista, sin
// depender de la rotación de la instancia) con la espiral pintada en el
// fragment shader — nada de geometría ni de miles de partículas reales por
// galaxia lejana.
const vertexShader = /* glsl */ `
  attribute float aColorMix;
  attribute float aArmCount;
  attribute float aTightness;
  attribute float aSeed;
  attribute float aRotationSpeed;

  uniform float uTime;

  varying vec2 vUv;
  varying float vColorMix;
  varying float vArmCount;
  varying float vTightness;
  varying float vRotation;

  void main() {
    vUv = uv;
    vColorMix = aColorMix;
    vArmCount = aArmCount;
    vTightness = aTightness;
    vRotation = uTime * aRotationSpeed + aSeed * 6.28318530718;

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
  uniform float uOpacity;

  varying vec2 vUv;
  varying float vColorMix;
  varying float vArmCount;
  varying float vTightness;
  varying float vRotation;

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float r = length(p);
    if (r > 1.0) discard;

    float theta = atan(p.y, p.x) + vRotation;
    float spiral = sin(theta * vArmCount - r * vTightness * 8.0) * 0.5 + 0.5;
    float falloff = pow(1.0 - r, 1.6);
    float core = smoothstep(0.35, 0.0, r);
    float brightness = mix(spiral * 0.7 + 0.3, 1.0, core) * falloff;

    vec3 color = mix(uColorWhite, uColorPrimary, clamp(vColorMix * 2.0, 0.0, 1.0));
    color = mix(color, uColorAccent, clamp(vColorMix * 2.0 - 1.0, 0.0, 1.0));

    float alpha = brightness * uOpacity;
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

const BillboardGalaxyMaterial = shaderMaterial(
  {
    uTime: 0,
    uOpacity: 1,
    uColorWhite: new THREE.Color("#ffffff"),
    uColorPrimary: new THREE.Color("#5142fc"),
    uColorAccent: new THREE.Color("#af50e5"),
  },
  vertexShader,
  fragmentShader
);

extend({ BillboardGalaxyMaterial });

export default BillboardGalaxyMaterial;
