import { createStore } from "zustand/vanilla";
import { chapterRegistry } from "./chapterRegistry";

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

// Store vanilla: el canvas (r3f) lee scrollStore.getState() dentro de useFrame,
// fuera del ciclo de render de React. Los componentes DOM que necesiten
// re-renderizar se suscriben con un selector (ver useChapter.js).
//
// Con el snap por capítulo, `chapterProgress` ya no es una fracción del
// scroll: es la fracción de la duración del autoplay del capítulo actual
// (0 al entrar, 1 cuando termina de reproducirse). El driver que la hace
// avanzar vive en useChapterNavigation.js; este store solo guarda el estado.
export const scrollStore = createStore((set) => ({
  chapterIndex: 0,
  chapterProgress: 0,
  setChapterProgress: (index, localP) => {
    const clampedIndex = Math.min(Math.max(index, 0), chapterRegistry.length - 1);
    set({ chapterIndex: clampedIndex, chapterProgress: clamp01(localP) });
  },
}));
