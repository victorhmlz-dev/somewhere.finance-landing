"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { getActProgress } from "@/lib/scroll/actProgress";

// Mismo --background de marca (#14141f), oscurecido hacia casi negro en los
// actos 1-2 y recuperado según avanza la Nebula — nunca un color nuevo,
// solo esa base escalada.
const BRAND_BACKGROUND = new THREE.Color("#14141f");
const NEAR_BLACK = BRAND_BACKGROUND.clone().multiplyScalar(0.12);

export default function SceneBackground() {
  const { scene } = useThree();
  const currentRef = useRef(null);
  const targetRef = useRef(null);

  // r3f expone `scene` desde useThree() precisamente para mutarlo así (API
  // imperativa documentada); el linter de react-compiler no conoce este
  // patrón de r3f y lo marca como si `scene` fuera estado de React.
  // eslint-disable-next-line react-hooks/immutability
  useEffect(() => {
    currentRef.current = new THREE.Color().copy(NEAR_BLACK);
    targetRef.current = new THREE.Color();
    // eslint-disable-next-line react-hooks/immutability
    scene.background = new THREE.Color().copy(currentRef.current);
  }, [scene]);

  useFrame(() => {
    const current = currentRef.current;
    const target = targetRef.current;
    if (!current || !target || !scene.background) return;

    const { chapterIndex, chapterProgress } = scrollStore.getState();
    const p3 = getActProgress(chapterIndex, chapterProgress, 2);
    target.copy(NEAR_BLACK).lerp(BRAND_BACKGROUND, p3 * 0.6);
    current.lerp(target, 0.08);
    scene.background.copy(current);
  });

  return null;
}
