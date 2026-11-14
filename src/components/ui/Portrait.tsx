"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTilt } from "@/hooks/useTilt";
import { useLanguage } from "@/hooks/useLanguage";

const PORTRAIT_SRC = "/images/portrait.jpg";
const STRIP_COUNT = 9;

export function Portrait({ alt, placeholder }: { alt: string; placeholder: string }) {
  const [failed, setFailed] = useState(false);
  const reducedMotion = useReducedMotion();
  const { t } = useLanguage();
  const { ref: tiltRef, onPointerMove, onPointerLeave } = useTilt(5, true);
  const rootRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const stripRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const image = imageRef.current;
    const strips = stripRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!root || !image) return;

    if (reducedMotion) {
      gsap.set(root, { autoAlpha: 1 });
      gsap.set(image, { scale: 1, filter: "grayscale(0) blur(0px)" });
      gsap.set(strips, { scaleY: 0 });
      return;
    }

    gsap.set(root, { autoAlpha: 1 });
    gsap.set(image, { scale: 1.15, filter: "grayscale(1) blur(10px)" });
    gsap.set(strips, { scaleY: 1 });
    if (flashRef.current) gsap.set(flashRef.current, { opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: root, start: "top 80%", once: true },
    });

    tl.to(image, { scale: 1, filter: "grayscale(0) blur(0px)", duration: 1.4, ease: "power2.out" })
      .to(
        strips,
        {
          scaleY: 0,
          duration: 0.7,
          stagger: { each: 0.045, from: "start" },
          ease: "power3.inOut",
          transformOrigin: (i) => (i % 2 === 0 ? "top" : "bottom"),
        },
        0.15
      )
      .to(flashRef.current, { opacity: 0.45, duration: 0.18, ease: "power1.in" }, 0.55)
      .to(flashRef.current, { opacity: 0, duration: 0.6, ease: "power2.out" }, 0.73);

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [reducedMotion]);

  return (
    <div
      ref={tiltRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="group relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-b from-[#101010] to-black [transform-style:preserve-3d] will-change-transform"
    >
      <div
        ref={rootRef}
        className="absolute inset-0"
        style={{ visibility: "hidden" }}
      >
        <div
          ref={imageRef}
          className="absolute inset-0 animate-[kenburns_22s_ease-in-out_infinite] motion-reduce:animate-none"
        >
          {!failed ? (
            <Image
              src={PORTRAIT_SRC}
              alt={alt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-[var(--ease-out-quart)] group-hover:scale-[1.04]"
              onError={() => setFailed(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#101010] to-black">
              <span
                className="text-[18vw] leading-none font-black select-none md:text-[9vw]"
                style={{ color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.28)" }}
              >
                {placeholder}
              </span>
            </div>
          )}
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: "radial-gradient(65% 55% at 50% 32%, rgba(115,87,255,0.18), transparent 70%)",
          }}
        />

        {/* Color-grade flash, timed to the shutter wipe. */}
        <div
          ref={flashRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 bg-accent mix-blend-color"
        />

        {/* Cursor-follow glare (driven by useTilt's --glare-* custom properties). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            opacity: "var(--glare-o, 0)",
            background:
              "radial-gradient(480px circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.16), transparent 60%)",
            mixBlendMode: "overlay",
          }}
        />

        {/* Shutter strips — the reveal wipe. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-30 flex">
          {Array.from({ length: STRIP_COUNT }).map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                stripRefs.current[i] = el;
              }}
              className="h-full flex-1 bg-[#030305]"
            />
          ))}
        </div>
      </div>

      {/* Viewfinder frame + REC / timecode readout, revealed on hover. */}
      <span className="pointer-events-none absolute top-5 left-5 z-40 h-6 w-6 border-t border-l border-accent/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <span className="pointer-events-none absolute right-5 bottom-5 z-40 h-6 w-6 border-r border-b border-accent/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="pointer-events-none absolute top-5 right-5 z-40 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.15em] text-white uppercase opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <span className="h-1.5 w-1.5 rounded-full bg-accent [animation:recPulse_1.4s_ease-in-out_infinite]" />
        REC
      </div>
      <div className="pointer-events-none absolute bottom-5 left-5 z-40 font-mono text-[10px] tracking-[0.15em] text-white/85 uppercase opacity-0 transition-opacity delay-75 duration-500 group-hover:opacity-100">
        {t.about.metaFocusValue}
      </div>
    </div>
  );
}
