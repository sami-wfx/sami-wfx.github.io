"use client";

import { useRef } from "react";
import { useRafLoop } from "./useRafLoop";
import { useIsTouchDevice } from "./useMediaQuery";
import { useReducedMotion } from "./useReducedMotion";
import { lerp } from "@/lib/utils";

/** Subtle perspective tilt + cursor-follow glare for premium card hovers. */
export function useTilt(maxDeg = 7, enabled = true) {
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0, glareX: 50, glareY: 50, active: 0 });
  const current = useRef({ x: 0, y: 0, glareX: 50, glareY: 50, active: 0 });
  const isTouch = useIsTouchDevice();
  const reducedMotion = useReducedMotion();
  const disabled = !enabled || isTouch || reducedMotion;

  useRafLoop(() => {
    const el = ref.current;
    if (!el) return;
    current.current.x = lerp(current.current.x, target.current.x, 0.1);
    current.current.y = lerp(current.current.y, target.current.y, 0.1);
    current.current.glareX = lerp(current.current.glareX, target.current.glareX, 0.14);
    current.current.glareY = lerp(current.current.glareY, target.current.glareY, 0.14);
    current.current.active = lerp(current.current.active, target.current.active, 0.1);

    el.style.transform = `perspective(1000px) rotateX(${current.current.x.toFixed(2)}deg) rotateY(${current.current.y.toFixed(2)}deg)`;
    el.style.setProperty("--glare-x", `${current.current.glareX.toFixed(1)}%`);
    el.style.setProperty("--glare-y", `${current.current.glareY.toFixed(1)}%`);
    el.style.setProperty("--glare-o", current.current.active.toFixed(3));
  }, !disabled);

  const onPointerMove = (e: React.PointerEvent) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    target.current.y = (px - 0.5) * maxDeg * 2;
    target.current.x = -(py - 0.5) * maxDeg * 2;
    target.current.glareX = px * 100;
    target.current.glareY = py * 100;
    target.current.active = 1;
  };

  const onPointerLeave = () => {
    target.current.x = 0;
    target.current.y = 0;
    target.current.active = 0;
  };

  return { ref, onPointerMove, onPointerLeave, disabled };
}
