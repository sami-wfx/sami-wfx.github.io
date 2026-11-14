"use client";

import { useRef, useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { RevealText } from "@/components/ui/RevealText";
import { SERVICE_KEYS } from "@/data/services";
import { useLanguage } from "@/hooks/useLanguage";
import { useRafLoop } from "@/hooks/useRafLoop";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn, lerp } from "@/lib/utils";

export function Services() {
  const { t } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const target = useRef({ x: 50, y: 50, opacity: 0 });
  const current = useRef({ x: 50, y: 50, opacity: 0 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useRafLoop(() => {
    current.current.x = lerp(current.current.x, target.current.x, 0.12);
    current.current.y = lerp(current.current.y, target.current.y, 0.12);
    current.current.opacity = lerp(current.current.opacity, target.current.opacity, 0.12);
    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(680px circle at ${current.current.x}% ${current.current.y}%, rgba(115,87,255,${0.12 * current.current.opacity}), transparent 60%)`;
    }
  }, !reducedMotion);

  const handleMove = (e: React.PointerEvent) => {
    if (!rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    target.current.x = ((e.clientX - rect.left) / rect.width) * 100;
    target.current.y = ((e.clientY - rect.top) / rect.height) * 100;
    target.current.opacity = 1;
  };

  return (
    <section id="services" className="px-[clamp(20px,4vw,72px)] py-28 sm:py-36">
      <div className="mx-auto max-w-[1700px]">
        <SectionLabel index={t.services.index}>{t.services.eyebrow}</SectionLabel>
        <h2 className="mt-4 mb-14 text-[clamp(48px,10vw,180px)] leading-[0.88] font-black tracking-tighter text-ink uppercase sm:mb-20">
          <RevealText as="span" className="block">
            {t.services.headingLine1}
          </RevealText>
          <RevealText as="span" className="block" delay={0.06}>
            {t.services.headingLine2}
          </RevealText>
        </h2>

        <div
          ref={rootRef}
          onPointerMove={handleMove}
          onPointerLeave={() => (target.current.opacity = 0)}
          className="relative overflow-hidden border-t border-line"
        >
          <div ref={glowRef} aria-hidden className="pointer-events-none absolute inset-0" />
          {SERVICE_KEYS.map((key, i) => {
            const item = t.services.items[key];
            const isHovered = hoveredIndex === i;
            const dimmed = hoveredIndex !== null && !isHovered;
            return (
              <div
                key={key}
                onPointerEnter={() => setHoveredIndex(i)}
                onPointerLeave={() => setHoveredIndex(null)}
                className={cn(
                  "group relative flex flex-col gap-2 border-b border-line py-10 transition-[opacity,background-color] duration-500 ease-[var(--ease-out-quart)] last:border-b-0 hover:bg-white/[0.025] sm:flex-row sm:items-baseline sm:justify-between sm:py-12",
                  dimmed && "opacity-[0.45]"
                )}
              >
                <div className="flex items-baseline gap-6">
                  <span
                    className={cn(
                      "font-mono text-xs transition-colors duration-300",
                      isHovered ? "text-accent" : "text-ink-faint"
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[clamp(32px,5.4vw,72px)] leading-none font-black tracking-tight text-ink uppercase transition-transform duration-500 ease-[var(--ease-out-quart)] group-hover:translate-x-3">
                    {item.title}
                  </span>
                </div>
                <span className="pl-12 font-mono text-xs tracking-[0.1em] text-ink-faint sm:pl-0">
                  {item.detail}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
