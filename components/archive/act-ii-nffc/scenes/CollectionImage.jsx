"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";

// Cache a nivel de módulo: si varias colecciones compartieran imagen (no es
// el caso hoy, pero evita recargar si vuelve a montarse el campo) o si el
// componente se remonta por HMR en desarrollo, no se repite la descarga.
const textureCache = new Map();
function loadTexture(url) {
  if (!textureCache.has(url)) {
    const promise = new Promise((resolve, reject) => {
      new THREE.TextureLoader().load(
        url,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          resolve(tex);
        },
        undefined,
        reject
      );
    });
    textureCache.set(url, promise);
  }
  return textureCache.get(url);
}

// Tarjeta de portada real (archivo en public/collections/, no arte
// generado) que flota junto a la galaxia procedural de su colección — no la
// sustituye, la acompaña (ver data/collections.js). Mientras el archivo no
// exista todavía, no renderiza nada: la galaxia sigue viéndose igual, sin
// huecos ni errores en consola (el loader falla en silencio vía .catch).
export default function CollectionImage({ config, getProgress, getOpacity }) {
  const [texture, setTexture] = useState(null);
  const materialRef = useRef();

  useEffect(() => {
    if (!config.image) return undefined;
    let cancelled = false;
    loadTexture(config.image)
      .then((tex) => {
        if (!cancelled) setTexture(tex);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [config.image]);

  useFrame(() => {
    if (!materialRef.current) return;
    // Mismo revelado que la galaxia que acompaña (getProgress/getOpacity
    // vienen de CollectionsField, idénticos a los que recibe su <Galaxy>):
    // la tarjeta aparece y desaparece a la vez que la galaxia, nunca antes
    // ni después.
    const reveal = getProgress ? getProgress() : 1;
    const opacity = getOpacity ? getOpacity() : 1;
    materialRef.current.opacity = reveal * opacity;
  });

  if (!texture) return null;

  // Flota justo por encima de la galaxia (radius*0.9 en Y), ligeramente
  // hacia cámara (+radius*0.3 en Z) para no fundirse con sus propias
  // partículas — escala atada al radio de la galaxia para que las tarjetas
  // de las colecciones grandes no queden minúsculas ni las pequeñas
  // sobredimensionadas.
  const [x, y, z] = config.position;
  const cardSize = Math.max(config.radius * 0.55, 2.5);

  return (
    <Billboard position={[x, y + config.radius * 0.9, z + config.radius * 0.3]}>
      <mesh scale={[cardSize, cardSize, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial ref={materialRef} map={texture} transparent opacity={0} depthWrite={false} />
      </mesh>
    </Billboard>
  );
}
