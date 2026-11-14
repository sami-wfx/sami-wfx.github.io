"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Runs `callback` every animation frame, pausing automatically while the
 * tab is hidden so idle background tabs don't burn GPU/CPU.
 */
export function useRafLoop(callback: (deltaMs: number) => void, active = true) {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      if (!document.hidden) callbackRef.current(delta);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);
}
