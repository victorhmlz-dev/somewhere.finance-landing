"use client";

import { useStore } from "zustand";
import { scrollStore } from "./scrollStore";

// Selector estrecho: solo re-renderiza al cruzar de capítulo, no en cada
// pixel de scroll (chapterProgress se lee aparte, directamente en el canvas).
export function useChapterIndex() {
  return useStore(scrollStore, (state) => state.chapterIndex);
}
