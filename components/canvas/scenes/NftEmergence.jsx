"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { isMobile } from "@/lib/tuning";
import { NFT_CARDS } from "@/data/nftCards";

// Tarjetas NFT que emergen de la Nebula: imágenes reales del proyecto
// (data/nftCards.js → public/collections/). Todas en desktop; en móvil solo
// las primeras, por presupuesto de texturas.
const ITEMS = NFT_CARDS.slice(0, isMobile ? 5 : NFT_CARDS.length);
// Tramo del acto 3 en el que van apareciendo, escalonadas (no todas "salen"
// de la nebulosa a la vez).
const REVEAL_START = 0.5;
const REVEAL_SPREAD = 0.3;

function randomDirection() {
  const z = 1 - 2 * Math.random();
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  const theta = Math.random() * Math.PI * 2;
  return [r * Math.cos(theta), r * Math.sin(theta), z];
}

// Posiciones a nivel de módulo (nunca Math.random durante el render).
const cards = ITEMS.map((item, i) => {
  const [dx, dy, dz] = randomDirection();
  const dist = 6 + Math.random() * 6;
  return {
    ...item,
    basePosition: [dx * dist, dy * dist, dz * dist],
    driftSeed: Math.random() * Math.PI * 2,
    revealAt: REVEAL_START + (ITEMS.length > 1 ? (i / (ITEMS.length - 1)) * REVEAL_SPREAD : 0),
  };
});

function loadTexture(loader, path) {
  return new Promise((resolve) => {
    loader.load(
      path,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        resolve(texture);
      },
      undefined,
      // Si una imagen falta o falla, esa tarjeta simplemente no se muestra.
      () => resolve(null)
    );
  });
}

function NftCard({ card, texture }) {
  const materialRef = useRef();
  const groupRef = useRef();

  useFrame((state) => {
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const p3 = getActProgress(chapterIndex, chapterProgress, 2);
    const p4 = getActProgress(chapterIndex, chapterProgress, 3);
    const appear = Math.min(Math.max((p3 - card.revealAt) / 0.16, 0), 1);
    // Se apagan según colapsa la Nebula en galaxia (acto 4): son parte del
    // lenguaje de "colecciones emergiendo", no del capítulo siguiente.
    const fadeOut = 1 - Math.min(p4 / 0.25, 1);
    const opacity = appear * fadeOut * 0.92;

    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      groupRef.current.position.set(
        card.basePosition[0] + Math.sin(t * 0.3 + card.driftSeed) * 0.4,
        card.basePosition[1] + Math.cos(t * 0.25 + card.driftSeed) * 0.4,
        card.basePosition[2]
      );
    }
    if (materialRef.current) {
      materialRef.current.opacity = opacity;
    }
  });

  return (
    <Billboard ref={groupRef}>
      <mesh scale={[1.6, 1.6, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial ref={materialRef} map={texture} transparent opacity={0} depthWrite={false} />
      </mesh>
    </Billboard>
  );
}

export default function NftEmergence() {
  const [textures, setTextures] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    Promise.all(cards.map((card) => loadTexture(loader, card.image))).then((loaded) => {
      if (cancelled) {
        loaded.forEach((t) => t?.dispose());
        return;
      }
      setTextures(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => () => textures?.forEach((t) => t?.dispose()), [textures]);

  if (!textures) return null;
  return (
    <>
      {cards.map((card, i) =>
        textures[i] ? <NftCard key={card.id} card={card} texture={textures[i]} /> : null
      )}
    </>
  );
}
