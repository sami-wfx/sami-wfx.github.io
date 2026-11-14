"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Cubic-bezier isn't cheap to evaluate per-frame by hand, so approximate the
// site's standard "ease-out-expo" feel with a plain quint-out — visually
// close enough for a ~1s count-up and avoids pulling in a bezier solver.
function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

/**
 * Animates the leading digit run of a stat value ("320+" -> counts 0..320,
 * keeps the "+" static) once, on entrance. Values with no leading digits
 * (e.g. "AE + PR") render as-is with no animation. Under reduced motion the
 * final value is rendered directly (derived from `reduce`, not stored in
 * state) so there's no dependency on the animation effect ever running.
 */
export function StatNumber({ value, start, delayMs = 0 }: { value: string; start: boolean; delayMs?: number }) {
  const reduce = useReducedMotion();
  const match = value.match(/^(\d+)(.*)$/);
  const [display, setDisplay] = useState(() => (match ? match[1].replace(/\d/g, "0") : value));
  const done = useRef(false);

  useEffect(() => {
    if (!match || reduce || !start || done.current) return;
    done.current = true;
    const digits = match[1];
    const target = Number(digits);
    const pad = digits.length;
    const duration = 1100;
    let frame = 0;
    let startTime: number | null = null;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const t = Math.min(1, (now - startTime) / duration);
      const eased = easeOutQuint(t);
      const current = Math.round(target * eased);
      setDisplay(String(current).padStart(pad, "0"));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    const timeout = setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, delayMs);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, reduce]);

  if (!match) return <>{value}</>;
  return (
    <>
      {reduce ? match[1] : display}
      {match[2]}
    </>
  );
}
