"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { RevealText } from "@/components/ui/RevealText";
import { AE_CAPABILITY_KEYS, PR_CAPABILITY_KEYS } from "@/data/toolkit";
import { ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const ToolkitScene = dynamic(
  () => import("@/components/3d/ToolkitScene").then((m) => m.ToolkitScene),
  { ssr: false }
);

/** Static CSS stand-in for the WebGL toolkit scene. The real scene renders a
 *  continuous per-frame WebGL loop (chrome text + two lit glass icons) that
 *  profiling showed responsible for ~95% of main-thread blocking time during
 *  scroll on throttled mobile CPUs — costly for a purely decorative element,
 *  so phones get this instead: same two-chip-plus-mark composition, zero
 *  render loop. */
function ToolkitFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-5" aria-hidden>
      <div
        className="flex h-16 w-16 -rotate-6 items-center justify-center rounded-2xl border border-white/10 text-xl font-bold text-white/90 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
        style={{ background: "linear-gradient(155deg, rgba(138,143,220,0.35), rgba(58,60,64,0.9))" }}
      >
        Ae
      </div>
      <span className="chrome-text text-[clamp(56px,14vw,80px)] leading-none font-black">S</span>
      <div
        className="flex h-16 w-16 rotate-6 items-center justify-center rounded-2xl border border-white/10 text-xl font-bold text-white/90 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
        style={{ background: "linear-gradient(155deg, rgba(111,159,214,0.35), rgba(58,60,64,0.9))" }}
      >
        Pr
      </div>
    </div>
  );
}

function CapabilityList({
  title,
  items,
  align,
}: {
  title: string;
  items: string[];
  align: "left" | "right";
}) {
  return (
    <div className={cn("glass-panel relative z-10 rounded-[12px] p-6", align === "right" && "md:text-right")}>
      <h3 className="flex items-center gap-2 text-sm font-bold tracking-[0.2em] text-ink uppercase">
        <span className={cn("text-accent-bright", align === "right" && "md:order-2")}>◆</span>
        {title}
      </h3>
      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className={cn(
              "group flex items-center gap-2.5 text-sm text-ink-dim transition-colors duration-300 hover:text-ink",
              align === "right" && "md:flex-row-reverse"
            )}
          >
            <span className="h-px w-4 shrink-0 bg-line transition-[background-color,width] duration-300 group-hover:w-6 group-hover:bg-accent" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Software() {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef({ value: 0 });

  useEffect(() => {
    if (!sectionRef.current || reducedMotion || isMobile) return;
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        progressRef.current.value = self.progress;
      },
    });
    return () => trigger.kill();
  }, [reducedMotion, isMobile]);

  const aeItems = AE_CAPABILITY_KEYS.map((key) => t.software.ae.capabilities[key]);
  const prItems = PR_CAPABILITY_KEYS.map((key) => t.software.pr.capabilities[key]);

  return (
    <section ref={sectionRef} data-scene="raised" className="relative px-[clamp(20px,4vw,72px)] py-28">
      <div className="mx-auto max-w-[1700px]">
        <SectionLabel index={t.software.index}>{t.software.eyebrow}</SectionLabel>
        <h2 className="mt-4 text-[clamp(34px,6.6vw,110px)] leading-[0.92] font-black tracking-tight text-ink uppercase">
          <RevealText as="span" className="block">
            {t.software.headingLine1}
          </RevealText>
          <span className="block text-accent">×</span>
          <RevealText as="span" className="block" delay={0.08}>
            {t.software.headingLine2}
          </RevealText>
        </h2>

        <div className="relative mt-16 grid grid-cols-1 items-center gap-14 md:grid-cols-[1fr_1.3fr_1fr]">
          <CapabilityList title={t.software.ae.name} items={aeItems} align="left" />

          <div className="relative order-first h-[280px] sm:h-[360px] md:order-none md:h-[440px]">
            {isMobile ? <ToolkitFallback /> : <ToolkitScene progressRef={progressRef} reducedMotion={reducedMotion} />}
          </div>

          <CapabilityList title={t.software.pr.name} items={prItems} align="right" />
        </div>
      </div>
    </section>
  );
}
