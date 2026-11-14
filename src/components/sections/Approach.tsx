"use client";

import { useEffect, useRef } from "react";
import { motion, type Variants } from "framer-motion";
import { ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useLanguage } from "@/hooks/useLanguage";
import { mapRange, clamp } from "@/lib/utils";
import { withGlyphFallback } from "@/lib/withGlyphFallback";
import { ApproachStages } from "./approach/ApproachStages";
import {
  VIOLET,
  VIOLET_LIGHT,
  BLUE,
  DISPLAY_FONT,
  HEADLINE_FONT,
  MONO_FONT,
  BG_DEEP,
  TEXT,
  MUTED,
  EASE_OUT,
} from "./approach/constants";

const lineReveal: Variants = {
  hidden: { y: 64, opacity: 0, filter: "blur(8px)" },
  show: (delay: number) => ({
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.85, delay, ease: EASE_OUT },
  }),
};

const fadeUp: Variants = {
  hidden: { y: 12, opacity: 0 },
  show: (delay: number) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, delay, ease: EASE_OUT },
  }),
};

export function Approach() {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef({ value: reducedMotion ? 1 : 0 });
  const outroWrapRef = useRef<HTMLDivElement>(null);
  const outroTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || reducedMotion) return;

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        progressRef.current.value = self.progress;

        const settle = clamp(mapRange(self.progress, 0.82, 0.98, 0, 1), 0, 1);
        if (outroWrapRef.current) {
          outroWrapRef.current.style.scale = String((1 - settle * 0.03).toFixed(3));
          outroWrapRef.current.style.opacity = String((1 - settle * 0.35).toFixed(3));
        }
        if (outroTextRef.current) {
          outroTextRef.current.style.opacity = String(settle.toFixed(3));
          outroTextRef.current.style.translate = `0 ${(10 - settle * 10).toFixed(1)}px`;
        }
      },
    });

    return () => trigger.kill();
  }, [reducedMotion]);

  const headline = t.approach.headline;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden px-[clamp(20px,4vw,72px)] pt-28 pb-24 sm:pt-36 sm:pb-32 lg:pt-44 lg:pb-40"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Фон теперь флэт — тот же --color-bg, что и везде на сайте (по
          просьбе: раньше здесь был градиент BG_DEEP→BG→SKY_MID плюс
          фиолетовое пятно, оба убраны, чтобы не создавать видимого
          отличия от остальных секций). Сетка осталась — это текстура,
          не источник цветового расхождения. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* тонкая сетка на весь фон — контент здесь не разбит на колонки,
            как в Hero, поэтому без бокового маскирования */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            WebkitMaskImage: "radial-gradient(65% 60% at 50% 25%, #000 30%, transparent 85%)",
            maskImage: "radial-gradient(65% 60% at 50% 25%, #000 30%, transparent 85%)",
          }}
        />

        {/* тёмный скрим под заголовком — держит контраст текста */}
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(62% 58% at 22% 30%, ${BG_DEEP}E0 0%, ${BG_DEEP}8F 44%, transparent 76%)` }}
        />

        <div
          className="text-outline absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none font-black opacity-[0.035] select-none"
          style={{ fontSize: "26vw", fontFamily: DISPLAY_FONT }}
        >
          AKYRO
        </div>
      </div>

      <div className="relative z-[1] mx-auto max-w-[1500px]">
        {/* top label */}
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
          className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] tracking-[0.2em] uppercase"
          style={{ color: MUTED, fontFamily: MONO_FONT }}
        >
          <span className="flex items-center gap-3">
            <span style={{ color: VIOLET_LIGHT }}>{t.approach.label.index}</span>
            <span className="h-px w-4" style={{ background: "rgba(255,255,255,0.2)" }} />
            {t.approach.label.title}
          </span>
          <span className="opacity-50">{t.approach.label.system}</span>
        </motion.div>

        {/* headline — тот же шрифт, что теперь в Hero (было Nunito/DISPLAY_FONT,
            для связности с новым плотным заголовком Hero) */}
        <h2
          className="mt-6 max-w-[1300px] text-white uppercase sm:mt-8"
          style={{
            fontFamily: HEADLINE_FONT,
            fontWeight: 800,
            lineHeight: 0.94,
            letterSpacing: "-0.02em",
            fontSize: "clamp(0.85rem, 4.4vw, 4rem)",
          }}
        >
          {headline.map((line, i) => {
            const isAccent = i === headline.length - 1;
            const glow = isAccent
              ? `0 0 6px ${VIOLET_LIGHT}66, 0 0 16px ${VIOLET}3D`
              : `0 0 5px ${VIOLET_LIGHT}47, 0 0 14px ${VIOLET}26`;
            return (
              <motion.span
                key={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                className="block overflow-hidden pb-[0.06em]"
              >
                <motion.span
                  variants={lineReveal}
                  custom={i * 0.1}
                  className="relative inline-block will-change-transform"
                  style={{ color: isAccent ? VIOLET_LIGHT : "#ffffff", textShadow: glow }}
                >
                  {withGlyphFallback(line, true)}
                  {isAccent && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 motion-safe:animate-[approachSweep_1.1s_ease-out_1]"
                      style={{
                        animationDelay: `${i * 0.1 + 0.5}s`,
                        animationFillMode: "both",
                        backgroundImage: `linear-gradient(100deg, transparent 40%, #fff 50%, ${BLUE} 56%, transparent 66%)`,
                        backgroundSize: "260% 100%",
                        backgroundPosition: "-90% 0",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                        opacity: 0.6,
                      }}
                    >
                      {line}
                    </span>
                  )}
                </motion.span>
              </motion.span>
            );
          })}
        </h2>

        {/* subtext */}
        <motion.p
          variants={fadeUp}
          custom={0.35}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="mt-6 max-w-[520px] text-[15px] leading-snug sm:text-[17px]"
          style={{ color: "rgba(245,245,247,0.62)" }}
        >
          {t.approach.subtext}
        </motion.p>

        {/* kinetic stage list — "Кадр за кадром" */}
        <div ref={outroWrapRef} className="mt-16 sm:mt-20 lg:mt-24">
          <ApproachStages reducedMotion={reducedMotion} />
        </div>

        {/* outro / transition to Work */}
        <div
          ref={outroTextRef}
          className="mt-10 flex flex-col items-start gap-1 font-mono text-[11px] tracking-[0.18em] uppercase sm:mt-12"
          style={{ color: MUTED, fontFamily: MONO_FONT, opacity: reducedMotion ? 1 : 0 }}
        >
          <span>{t.approach.outro.line}</span>
          <span className="flex items-center gap-2" style={{ color: TEXT }}>
            <span aria-hidden style={{ color: VIOLET_LIGHT }}>
              ↓
            </span>
            {t.approach.outro.next}
          </span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes approachSweep {
          from {
            background-position: -90% 0;
          }
          to {
            background-position: 190% 0;
          }
        }
      `}</style>
    </section>
  );
}
