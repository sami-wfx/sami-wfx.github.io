"use client";

import { useEffect, useRef, useState } from "react";
import { useCursor } from "@/hooks/useCursor";
import { useRafLoop } from "@/hooks/useRafLoop";
import { useIsTouchDevice } from "@/hooks/useMediaQuery";
import { useLanguage } from "@/hooks/useLanguage";
import { lerp } from "@/lib/utils";

export function CustomCursor() {
  const isTouch = useIsTouchDevice();
  const { label } = useCursor();
  const { t } = useLanguage();
  const labelText = label ? t.cursor[label] : null;
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  const raw = useRef({ x: 0, y: 0 });
  const eased = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isTouch) return;

    const onMove = (e: PointerEvent) => {
      raw.current.x = e.clientX;
      raw.current.y = e.clientY;
      if (!visible) setVisible(true);
    };
    const onLeave = () => setVisible(false);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [isTouch, visible]);

  useRafLoop(() => {
    if (dotRef.current) {
      dotRef.current.style.transform = `translate3d(${raw.current.x}px, ${raw.current.y}px, 0) translate(-50%, -50%)`;
    }
    eased.current.x = lerp(eased.current.x, raw.current.x, 0.18);
    eased.current.y = lerp(eased.current.y, raw.current.y, 0.18);
    if (ringRef.current) {
      ringRef.current.style.transform = `translate3d(${eased.current.x}px, ${eased.current.y}px, 0) translate(-50%, -50%)`;
    }
  }, !isTouch);

  if (isTouch) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] hidden md:block"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}
    >
      {/* Used to use mix-blend-mode: difference for contrast-adaptive
          color against any background — dropped it. It's a page-wide
          fixed overlay running every rAF frame, and a live blend mode
          forces the browser to recomposite whatever's underneath it in
          software each frame, including the showreel video, which read
          as dropped frames/slow playback. The site's background is one
          flat dark tone everywhere now anyway, so a plain white cursor
          with a small shadow for contrast is enough — no blending
          needed. */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 h-1.5 w-1.5 rounded-full bg-white"
        style={{ willChange: "transform", boxShadow: "0 0 0 1px rgba(0,0,0,0.25)" }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 flex items-center justify-center rounded-full border border-white text-[10px] font-medium tracking-[0.1em] text-white uppercase"
        style={{
          width: label ? 84 : pressed ? 28 : 36,
          height: label ? 84 : pressed ? 28 : 36,
          transition: "width 0.35s var(--ease-out-expo), height 0.35s var(--ease-out-expo), background-color 0.35s ease",
          willChange: "transform, width, height",
          backgroundColor: label ? "rgba(255,255,255,0.12)" : "transparent",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.25)",
        }}
      >
        {labelText}
      </div>
    </div>
  );
}
