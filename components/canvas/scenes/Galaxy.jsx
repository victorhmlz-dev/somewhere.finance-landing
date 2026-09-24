"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import "./GalaxyMaterial";

// Galaxia procedural genérica: la reutiliza el LOD cercano del universo
// (cap. 05) y, archivadas, colecciones/chains (ver
// docs/ARCHIVED_NFFC_ACT.md). `getProgress` (opcional) decide cuánto se
// revela cada frame; `getPosition` (opcional) permite animar su posición por
// frame (usado por el cierre de "the-universe" para converger las galaxias
// hacia el origen) — si no se pasa, la posición es la estática de
// `config.position`, como siempre.
//
// `groupRotation`/`driftSpeed` son [x, y, z] en radianes (y radianes/segundo
// para el drift) — rotación libre en los tres ejes, no solo Y. Un solo
// número también funciona (atajo para "solo Y", por compatibilidad con
// configs que aún no se hayan actualizado al array).
const toXYZ = (v) => (Array.isArray(v) ? v : [0, v ?? 0, 0]);

export default function Galaxy({ config, attrs, getProgress, getOpacity, getPosition, opacity = 1 }) {
  const materialRef = useRef();
  const groupRef = useRef();
  const { gl } = useThree();

  useFrame((state) => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uTime = state.clock.elapsedTime;
    mat.uPixelRatio = gl.getPixelRatio();
    mat.uProgress = getProgress ? getProgress() : 1;
    mat.uOpacity = getOpacity ? getOpacity() : opacity;
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      const [rx, ry, rz] = toXYZ(config.groupRotation);
      const [dx, dy, dz] = toXYZ(config.driftSpeed);
      groupRef.current.rotation.set(rx + t * dx, ry + t * dy, rz + t * dz);
      if (getPosition) groupRef.current.position.set(...getPosition());
    }
  });

  return (
    <group ref={groupRef} position={config.position ?? [0, 0, 0]}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[attrs.position, 3]} />
          <bufferAttribute attach="attributes-aRadiusSeed" args={[attrs.aRadiusSeed, 1]} />
          <bufferAttribute attach="attributes-aArmIndex" args={[attrs.aArmIndex, 1]} />
          <bufferAttribute attach="attributes-aAngleJitter" args={[attrs.aAngleJitter, 1]} />
          <bufferAttribute attach="attributes-aHeightSeed" args={[attrs.aHeightSeed, 1]} />
          <bufferAttribute attach="attributes-aSeed" args={[attrs.aSeed, 1]} />
          <bufferAttribute attach="attributes-aBaseSize" args={[attrs.aBaseSize, 1]} />
          <bufferAttribute attach="attributes-aColorMix" args={[attrs.aColorMix, 1]} />
        </bufferGeometry>
        <galaxyMaterial
          ref={materialRef}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uArmCount={config.armCount}
          uTightness={config.tightness}
          uRadius={config.radius}
          uThickness={config.thickness}
          uNoiseAmount={config.noiseAmount}
          uRotationSpeed={config.rotationSpeed}
          uCoreSize={config.coreSize}
          uSizeScale={config.particleScale ?? 1}
          uOpacity={opacity}
        />
      </points>
    </group>
  );
}
