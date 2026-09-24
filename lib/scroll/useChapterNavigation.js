"use client";

import { useEffect, useRef } from "react";
import { scrollStore } from "./scrollStore";
import { chapterRegistry } from "./chapterRegistry";
import { SNAP } from "@/lib/tuning";

const LAST_INDEX = chapterRegistry.length - 1;

// Snap por capítulo con autoplay: un gesto (rueda/touch/teclado) salta al
// capítulo siguiente o anterior; su coreografía se reproduce sola en
// chapterRegistry[i].duration segundos. El "bloqueo" no es del scroll físico
// (ya no hay scroll real que recorrer) sino del propio gesto: se ignoran
// gestos nuevos durante SNAP.lockMs para que varias muescas de rueda no
// salten de golpe varios capítulos — pasado ese bloqueo brevísimo, el
// usuario ya puede saltar de nuevo aunque la animación (2.5-4s) siga sola.
export function useChapterNavigation() {
  const currentIndexRef = useRef(0);
  const chapterStartRef = useRef(0);
  const lastNavAtRef = useRef(0);
  const debugLockedRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const touchStartYRef = useRef(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = media.matches;
    const onMediaChange = (e) => {
      reducedMotionRef.current = e.matches;
    };
    media.addEventListener("change", onMediaChange);

    const goTo = (rawIndex) => {
      const index = Math.min(Math.max(rawIndex, 0), LAST_INDEX);
      if (index === currentIndexRef.current) return;
      currentIndexRef.current = index;
      chapterStartRef.current = performance.now();
      debugLockedRef.current = false;
      // reduced motion: sin autoplay coreografiado — salta directo al
      // estado final del capítulo, sin la animación intermedia.
      scrollStore.getState().setChapterProgress(index, reducedMotionRef.current ? 1 : 0);
    };

    const canNavigate = () => performance.now() - lastNavAtRef.current > SNAP.lockMs;
    const navigate = (direction) => {
      if (!canNavigate()) return;
      lastNavAtRef.current = performance.now();
      goTo(currentIndexRef.current + direction);
    };

    const onWheel = (e) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < SNAP.wheelThreshold) return;
      navigate(e.deltaY > 0 ? 1 : -1);
    };

    const onKeyDown = (e) => {
      if (["ArrowDown", "PageDown"].includes(e.key)) {
        e.preventDefault();
        navigate(1);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        navigate(-1);
      }
    };

    const onTouchStart = (e) => {
      touchStartYRef.current = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      e.preventDefault(); // sin scroll/rubber-band nativo mientras dura el gesto
    };
    const onTouchEnd = (e) => {
      if (touchStartYRef.current === null) return;
      const delta = touchStartYRef.current - e.changedTouches[0].clientY;
      touchStartYRef.current = null;
      if (Math.abs(delta) < SNAP.touchThresholdPx) return;
      navigate(delta > 0 ? 1 : -1);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    // Modo debug: solo en desarrollo. "Salta al capítulo N con su animación
    // en el punto p de su propia duración" — misma API externa que antes.
    if (process.env.NODE_ENV !== "production") {
      const params = new URLSearchParams(window.location.search);
      const debugChapter = params.get("chapter");
      const debugP = params.get("p");
      if (debugChapter !== null && debugP !== null) {
        debugLockedRef.current = true;
        currentIndexRef.current = Number(debugChapter);
        scrollStore.getState().setChapterProgress(Number(debugChapter), Number(debugP));
      }

      window.__SOMEWHERE_DEBUG__ = {
        chapterCount: chapterRegistry.length,
        setChapter(index, localP) {
          debugLockedRef.current = true;
          currentIndexRef.current = index;
          scrollStore.getState().setChapterProgress(index, localP);
        },
        release() {
          debugLockedRef.current = false;
          chapterStartRef.current = performance.now() - localPToMs(scrollStore.getState().chapterProgress, currentIndexRef.current);
        },
      };
    }

    function localPToMs(p, index) {
      return p * chapterRegistry[index].duration * 1000;
    }

    // Driver de autoplay: avanza chapterProgress de 0 a 1 en la duración del
    // capítulo activo. Nunca crea/destruye nada, solo escribe en el store.
    let rafId;
    const tick = () => {
      if (!debugLockedRef.current && !reducedMotionRef.current) {
        const duration = chapterRegistry[currentIndexRef.current].duration * 1000;
        const elapsed = performance.now() - chapterStartRef.current;
        const t = duration > 0 ? Math.min(Math.max(elapsed / duration, 0), 1) : 1;
        scrollStore.getState().setChapterProgress(currentIndexRef.current, t);
      }
      rafId = requestAnimationFrame(tick);
    };
    chapterStartRef.current = performance.now();
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      media.removeEventListener("change", onMediaChange);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      if (process.env.NODE_ENV !== "production") {
        delete window.__SOMEWHERE_DEBUG__;
      }
    };
  }, []);
}
