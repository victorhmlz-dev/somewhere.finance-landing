"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";
import { getFlashPeak } from "./Flash";
import { BIGBANG } from "@/lib/tuning";
import "./CoinMaterial";

const { instancesPerChain: COUNT, maxDistance: MAX_DISTANCE, scaleRange: SCALE_RANGE, coinColor: COIN_COLOR } =
  BIGBANG.coins;

const COINS = [
  { id: "eth", logo: "/logos/eth-diamond-purple.svg" },
  { id: "bnb", logo: "/logos/bnb-symbol-yellow.svg" },
  { id: "sol", logo: "/logos/Solana_logo.png" },
  { id: "rob", logo: "/logos/robinhood.png" },
];

function randomDirection() {
  const z = 1 - 2 * Math.random();
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  const theta = Math.random() * Math.PI * 2;
  return new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta), z);
}

function createInstances(count) {
  return Array.from({ length: count }, () => ({
    direction: randomDirection(),
    speed: 0.6 + Math.random() * 1.2,
    rotationAxis: randomDirection(),
    rotationSpeed: (0.8 + Math.random() * 1.4) * (Math.random() < 0.5 ? -1 : 1),
    scale: SCALE_RANGE[0] + Math.random() * (SCALE_RANGE[1] - SCALE_RANGE[0]),
    delay: Math.random() * 0.1,
  }));
}

// Textura de cada logo rasterizada a un tamaño fijo: los SVG ya sourceados
// (public/logos/README.md) no declaran width/height propios (solo
// viewBox). Un <img> usado directamente como fuente de THREE.Texture se
// sube a la GPU con sus dimensiones NATURALES (naturalWidth/naturalHeight,
// el tamaño de reemplazo por defecto del navegador para un SVG sin tamaño
// intrínseco), no con `.width`/`.height` asignados por JS — esos solo
// afectan al layout en el DOM, no al bitmap decodificado. Dibujar la
// imagen en un canvas con un `drawImage` de destino explícito sí fuerza el
// tamaño real del bitmap resultante (mismo patrón que NftEmergence.jsx),
// evitando el GL_INVALID_VALUE ("offset overflows texture dimensions") que
// daba pasar el <img> crudo con un tamaño no controlado.
function loadSvgTexture(path) {
  const SIZE = 256;
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, SIZE, SIZE);
      const texture = new THREE.CanvasTexture(canvas);
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      resolve(texture);
    };
    image.src = path;
  });
}

const dummy = new THREE.Object3D();

function CoinGroup({ instances, texture }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const geometry = useMemo(() => new THREE.CircleGeometry(1, 24), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const p2 = getActProgress(chapterIndex, chapterProgress, 1);
    const p3 = getActProgress(chapterIndex, chapterProgress, 2);
    const peak = getFlashPeak(chapterIndex, p2);

    for (let i = 0; i < instances.length; i += 1) {
      const inst = instances[i];
      const local = Math.min(Math.max((p2 - inst.delay) / (1 - inst.delay), 0), 1);
      const eased = 1 - Math.pow(1 - local, 3);
      const dist = eased * MAX_DISTANCE * (0.6 + inst.speed * 0.4);

      dummy.position.copy(inst.direction).multiplyScalar(dist);
      dummy.rotation.set(
        clock.elapsedTime * inst.rotationSpeed * 0.7,
        clock.elapsedTime * inst.rotationSpeed,
        clock.elapsedTime * inst.rotationSpeed * 0.5
      );
      dummy.scale.setScalar(inst.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    if (materialRef.current) {
      // Aparecen justo tras el flash (no encima, para no competir con el
      // pico de luz) y se desvanecen al asentarse la Nebula.
      const appear = 1 - Math.pow(1 - Math.min(Math.max((p2 - 0.05) / 0.2, 0), 1), 2);
      const fade = 1 - Math.min(Math.max((p3 - 0.5) / 0.5, 0), 1);
      materialRef.current.uOpacity = appear * fade * (1 - peak * 0.6);
      materialRef.current.uMap = texture;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, instances.length]} frustumCulled={false}>
      <coinMaterial
        ref={materialRef}
        uCoinColor={new THREE.Color(COIN_COLOR)}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.NormalBlending}
      />
    </instancedMesh>
  );
}

const coinInstances = COINS.map(() => createInstances(COUNT));

export default function CoinBurst() {
  const [textures, setTextures] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all(COINS.map((c) => loadSvgTexture(c.logo))).then((loaded) => {
      if (!cancelled) setTextures(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!textures) return undefined;
    return () => {
      textures.forEach((t) => t.dispose());
    };
  }, [textures]);

  if (!textures) return null;

  return (
    <>
      {COINS.map((coin, i) => (
        <CoinGroup key={coin.id} instances={coinInstances[i]} texture={textures[i]} />
      ))}
    </>
  );
}
