"use client";

import { useEffect, useRef } from "react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import type { Project } from "@/data/projects";

export function ProjectItem({
  project,
  index,
  reversed,
}: {
  project: Project;
  index: number;
  reversed: boolean;
}) {
  const infoRef = useRef<HTMLDivElement>(null);
  const mediaWrapRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { t } = useLanguage();

  useEffect(() => {
    if (!infoRef.current || reducedMotion) return;
    const el = infoRef.current;
    const tween = gsap.fromTo(
      el,
      { autoAlpha: 0, y: 28 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reducedMotion]);

  // Media reveal: clip-path wipe rather than a plain fade.
  useEffect(() => {
    if (!mediaWrapRef.current) return;
    const el = mediaWrapRef.current;

    if (reducedMotion) {
      gsap.set(el, { clipPath: "inset(0% 0 0 0)" });
      return;
    }

    gsap.set(el, { clipPath: "inset(100% 0 0 0)" });
    const tween = gsap.to(el, {
      clipPath: "inset(0% 0 0 0)",
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reducedMotion]);

  const category = t.work.categories[project.categoryKey];
  const services = project.serviceKeys.map((key) => t.work.serviceTags[key]);
  const isVertical = project.orientation === "vertical";

  return (
    <div className="group flex min-h-[82vh] flex-col justify-center gap-8 border-t border-line py-16 sm:py-24">
      <div
        ref={infoRef}
        className={cn("flex flex-col gap-5", reversed && "sm:items-end sm:text-right")}
      >
        <span className="font-mono text-xs tracking-[0.2em] text-ink-faint uppercase">
          <span className="text-ink-faint transition-colors duration-300 group-hover:text-accent">
            {String(index + 1).padStart(2, "0")}
          </span>
          {" / "}
          {category} · {project.year}
        </span>

        <h3 className="flex items-center gap-5 text-[clamp(42px,7.5vw,120px)] leading-[0.94] font-black tracking-tight text-ink uppercase">
          <span className="transition-transform duration-500 ease-[var(--ease-out-quart)] group-hover:translate-x-3">
            {project.title}
          </span>
          <svg
            aria-hidden
            width="0.6em"
            height="0.6em"
            viewBox="0 0 24 24"
            fill="none"
            className="shrink-0 -translate-x-3 text-accent opacity-0 transition-all duration-500 ease-[var(--ease-out-quart)] group-hover:translate-x-0 group-hover:opacity-100"
          >
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </h3>

        <div className={cn("flex flex-wrap gap-x-8 gap-y-2", reversed && "sm:justify-end")}>
          <p className="text-sm text-ink-dim">
            <span className="font-mono text-[11px] tracking-[0.1em] text-ink-faint uppercase">
              {t.work.software}:{" "}
            </span>
            {project.software.join(" · ")}
          </p>
          <p className="font-mono text-[11px] tracking-[0.1em] text-ink-faint uppercase">
            {services.join(" · ")}
          </p>
        </div>
      </div>

      <div ref={mediaWrapRef}>
        {isVertical ? (
          <div className={cn("relative w-full max-w-[300px] sm:max-w-[340px]", reversed ? "sm:ml-auto" : "sm:mr-auto")}>
            <span
              aria-hidden
              className="absolute top-3 left-1/2 z-20 h-1 w-10 -translate-x-1/2 rounded-full bg-ink/15"
            />
            <MediaFrame
              src={project.videoSrc}
              label={project.title}
              className="aspect-[9/16] w-full ring-1 ring-ink/10"
              cursorLabel="view"
              revealOnScroll={false}
              tilt
            />
          </div>
        ) : (
          <MediaFrame
            src={project.videoSrc}
            label={project.title}
            className="aspect-video w-full sm:aspect-[21/9]"
            cursorLabel="view"
            revealOnScroll={false}
            tilt
          />
        )}
      </div>
    </div>
  );
}
