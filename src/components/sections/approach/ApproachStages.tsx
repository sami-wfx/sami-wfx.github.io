"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { useRafLoop } from "@/hooks/useRafLoop";
import { useLanguage } from "@/hooks/useLanguage";
import { HEADLINE_FONT, MONO_FONT, TEXT, MUTED, EASE_OUT } from "./constants";

const GREEN = "#B8F04A";

// One accent per stage, walking the site's existing violet→blue→green
// family rather than inventing new hues — the last stage ("Результат")
// lands on the same green Hero uses for its stats, so the payoff stage
// visually rhymes with the numbers that back it up.
const STAGE_ACCENTS = ["#6D8CFF", "#8C63FF", "#B18AFF", GREEN] as const;

const wordReveal: Variants = {
  hidden: { y: 44, opacity: 0 },
  show: (delay: number) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.75, delay, ease: EASE_OUT },
  }),
};

export function ApproachStages({ reducedMotion }: { reducedMotion: boolean }) {
  const { t } = useLanguage();
  const stages = t.approach.stages;
  const lastIndex = stages.length - 1;

  const [activeStage, setActiveStage] = useState(reducedMotion ? lastIndex : -1);
  const stageEls = useRef<(HTMLDivElement | null)[]>([]);
  const tcRef = useRef<HTMLSpanElement>(null);
  const frame = useRef(0);

  // Which word is active is decided by what's actually centered in the
  // viewport, not by overall section scroll progress — this list is tall
  // enough now (four full-width kinetic words) that a fixed progress→index
  // mapping would drift out of sync with what's on screen.
  useEffect(() => {
    if (reducedMotion) return;

    const els = stageEls.current.filter((el): el is HTMLDivElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = els.indexOf(entry.target as HTMLDivElement);
          if (i === -1) continue;
          setActiveStage(i);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reducedMotion]);

  // Ambient ticking frame counter only — purely decorative texture, not
  // tied to scroll or stage state.
  useRafLoop(() => {
    frame.current = (frame.current + 1) % (24 * 60);
    if (tcRef.current) {
      const f = frame.current % 24;
      const s = Math.floor(frame.current / 24) % 60;
      tcRef.current.textContent = `00:00:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
    }
  }, !reducedMotion);

  return (
    <div className="relative">
      {/* live-sequence readout — carries over EditTimeline's one deliberate
          echo of Hero's pulsing status dot, plus a ticking frame counter */}
      <div
        className="relative z-[1] mb-7 flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.14em] uppercase sm:mb-9"
        style={{ color: MUTED, fontFamily: MONO_FONT }}
      >
        <span className="relative flex h-[6px] w-[6px]">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-70"
            style={{ background: GREEN, animation: reducedMotion ? undefined : "recPulse 1.8s ease-in-out infinite" }}
          />
          <span className="relative inline-flex h-[6px] w-[6px] rounded-full" style={{ background: GREEN }} />
        </span>
        {t.approach.timeline.live}
        <span className="text-white/20">/</span>
        <span ref={tcRef}>00:00:00:00</span>
        <span className="text-white/20">·</span>
        <span>24 FPS</span>
      </div>

      <div className="relative z-[1] flex flex-col border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {stages.map((s, i) => {
          const isActive = i === activeStage;
          const accent = STAGE_ACCENTS[i];
          return (
            <motion.div
              key={s.n}
              ref={(el) => {
                stageEls.current[i] = el;
              }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.4 }}
              custom={i * 0.08}
              variants={wordReveal}
              className="group grid grid-cols-[1fr] items-baseline gap-x-6 gap-y-2 border-t py-6 sm:grid-cols-[56px_1fr_auto] sm:gap-x-8 sm:py-8"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <span
                className="hidden font-mono text-[12px] tracking-[0.1em] transition-colors duration-500 sm:block"
                style={{ color: isActive ? accent : "rgba(245,245,247,0.28)", fontFamily: MONO_FONT }}
              >
                {s.n}
              </span>

              <div className="overflow-hidden">
                <div
                  className="inline-block font-black uppercase transition-[color,text-shadow,transform] duration-500 group-hover:translate-x-[6px]"
                  style={{
                    fontFamily: HEADLINE_FONT,
                    fontSize: "clamp(2.1rem, 6.6vw, 4.8rem)",
                    lineHeight: 0.88,
                    letterSpacing: "-0.01em",
                    color: isActive ? "#ffffff" : "rgba(245,245,247,0.8)",
                    textShadow: isActive ? `0 0 46px ${accent}80` : "none",
                  }}
                >
                  {s.title}
                </div>
                <div
                  className="mt-1.5 font-mono text-[11px] tracking-[0.1em] uppercase transition-[opacity,transform] duration-500 sm:mt-2"
                  style={{
                    color: accent,
                    fontFamily: MONO_FONT,
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? "translateY(0)" : "translateY(-4px)",
                  }}
                >
                  {s.n} — {s.meta}
                </div>
              </div>

              <p
                className="max-w-[280px] text-[13.5px] leading-snug transition-colors duration-500 sm:text-right sm:text-[14px]"
                style={{ color: isActive ? TEXT : MUTED }}
              >
                {s.text}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
