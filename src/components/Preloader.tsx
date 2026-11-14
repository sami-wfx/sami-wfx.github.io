"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSetAppReady } from "@/hooks/useAppReady";
import { useLanguage } from "@/hooks/useLanguage";
import { Grain } from "@/components/ui/Grain";

// Restored per request.
const SPLASH_ENABLED = true;

const WORD_CLASS = "text-[13vw] leading-none font-black tracking-tight sm:text-[9vw]";

// Same photo as About's Portrait — reusing the real headshot rather than a
// generic mark, cropped tight to the face for a small circular badge.
const AVATAR_SRC = "/images/portrait.jpg";

const SPARKS = [
  { l: "18%", d: 0, dur: 3.4, c: "var(--color-accent-bright)" },
  { l: "32%", d: 0.6, dur: 4.1, c: "var(--color-accent-blue)" },
  { l: "48%", d: 1.4, dur: 3.7, c: "#ffffff" },
  { l: "61%", d: 0.2, dur: 4.4, c: "var(--color-accent-blue)" },
  { l: "74%", d: 1.9, dur: 3.2, c: "var(--color-accent-bright)" },
  { l: "84%", d: 0.9, dur: 3.9, c: "#ffffff" },
];

export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const avatarWrapRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const wordWrapRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const [unmounted, setUnmounted] = useState(false);
  const reducedMotion = useReducedMotion();
  const setAppReady = useSetAppReady();
  const { t } = useLanguage();

  useEffect(() => {
    if (!SPLASH_ENABLED) {
      setAppReady(true);
      return;
    }

    let cancelled = false;
    const counter = { value: 0 };

    // Single source of truth for "how loaded are we" — drives the number,
    // the wordmark's left-to-right reveal, the progress bar fill, and the
    // ring around the avatar, all from one tween.
    const paint = () => {
      const pct = counter.value;
      if (numberRef.current) numberRef.current.textContent = String(Math.round(pct)).padStart(3, "0");
      if (revealRef.current) revealRef.current.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      if (barFillRef.current) barFillRef.current.style.transform = `scaleX(${pct / 100})`;
      if (ringRef.current) ringRef.current.style.setProperty("--deg", `${(pct / 100) * 360}deg`);
    };

    // Entrance — the avatar badge drops in first, the wordmark follows a
    // beat later, with a touch of overshoot so it reads as a punch, not a
    // fade. `back.out` on the avatar is what makes the whole open feel
    // more alive than a plain opacity tween.
    const intro = gsap.timeline();
    intro
      .fromTo(
        avatarWrapRef.current,
        { opacity: 0, y: -14, scale: 0.7 },
        { opacity: 1, y: 0, scale: 1, duration: reducedMotion ? 0.18 : 0.42, ease: reducedMotion ? "power2.out" : "back.out(1.9)" }
      )
      .fromTo(
        wordWrapRef.current,
        { opacity: 0, y: 16, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: reducedMotion ? 0.18 : 0.4, ease: "power3.out" },
        reducedMotion ? undefined : "-=0.22"
      );

    const sweep = gsap.to(sweepRef.current, {
      xPercent: 260,
      duration: reducedMotion ? 0.5 : 0.9,
      repeat: -1,
      ease: "power1.inOut",
    });

    // Fast optimistic trickle to 90 (not 100 — the last stretch is reserved
    // for the real "ready" snap, so it never looks like it finished twice).
    const trickle = gsap.to(counter, {
      value: 90,
      duration: reducedMotion ? 0.2 : 0.6,
      ease: "power2.out",
      onUpdate: paint,
    });

    // Gate only on what the Hero itself needs to paint (fonts) plus a
    // short minimum brand moment.
    const ready = Promise.all([
      typeof document !== "undefined" ? document.fonts.ready : Promise.resolve(),
      new Promise((r) => setTimeout(r, reducedMotion ? 0 : 220)),
    ]);

    ready.then(() => {
      if (cancelled) return;
      trickle.kill();
      gsap.to(counter, {
        value: 100,
        duration: reducedMotion ? 0.12 : 0.22,
        ease: "power1.out",
        onUpdate: paint,
        onComplete: () => {
          sweep.kill();
          setAppReady(true);
          const tl = gsap.timeline({
            delay: 0.08,
            onComplete: () => setUnmounted(true),
          });
          // a quick bright pulse marks "done" before the whole thing collapses
          tl.to(flashRef.current, { opacity: 0.55, duration: 0.09, ease: "power1.out" })
            .to(flashRef.current, { opacity: 0, duration: 0.3, ease: "power2.out" }, ">-0.02")
            .to(
              contentRef.current,
              {
                scale: 1.06,
                opacity: 0,
                duration: reducedMotion ? 0.15 : 0.22,
                ease: "power2.in",
              },
              "<"
            )
            .to(
              rootRef.current,
              {
                yPercent: -100,
                duration: reducedMotion ? 0.2 : 0.42,
                ease: "expo.inOut",
              },
              reducedMotion ? undefined : "-=0.12"
            );
        },
      });
    });

    return () => {
      cancelled = true;
      trickle.kill();
      sweep.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!SPLASH_ENABLED || unmounted) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-bg"
      style={{ willChange: "transform" }}
      role="status"
      aria-label={t.a11y.loading}
    >
      {/* ambient glow — three soft brand-color blobs drifting behind the
          content, so the hold reads as alive rather than a static logo on black */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[70vmin] w-[70vmin] -translate-x-[64%] -translate-y-[54%] opacity-60 motion-safe:animate-[preloaderGlowDriftA_5s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(closest-side, var(--color-accent-bright), transparent 70%)", filter: "blur(60px)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[60vmin] w-[60vmin] -translate-x-[34%] -translate-y-[44%] opacity-50 motion-safe:animate-[preloaderGlowDriftB_6.5s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(closest-side, var(--color-accent-blue), transparent 70%)", filter: "blur(60px)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[46vmin] w-[46vmin] -translate-x-1/2 -translate-y-[30%] opacity-40 motion-safe:animate-[preloaderGlowDriftC_7.5s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(closest-side, var(--color-accent), transparent 72%)", filter: "blur(70px)" }}
      />

      {/* sparks — a handful of embers drifting up through the frame */}
      {SPARKS.map((s, i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute bottom-0 h-1 w-1 rounded-full opacity-0 motion-safe:animate-[preloaderSparkRise_var(--sd)_ease-in_infinite]"
          style={{
            left: s.l,
            background: s.c,
            boxShadow: `0 0 6px ${s.c}`,
            ["--sd" as string]: `${s.dur}s`,
            animationDelay: `${s.d}s`,
          }}
        />
      ))}

      <div ref={contentRef} className="relative flex flex-col items-center">
        {/* avatar badge — the real headshot, framed by a ring that fills
            with the same counter driving the wordmark and the bar below */}
        <div
          ref={avatarWrapRef}
          className="relative mb-5 motion-safe:animate-[preloaderAvatarFloat_4.5s_ease-in-out_infinite]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 scale-[1.7] opacity-70 motion-safe:animate-[preloaderGlowPulse_2.6s_ease-in-out_infinite]"
            style={{
              background: "radial-gradient(closest-side, var(--color-accent-bright), transparent 72%)",
              filter: "blur(20px)",
            }}
          />
          <div
            ref={ringRef}
            className="h-[92px] w-[92px] rounded-full p-[3px] sm:h-[112px] sm:w-[112px]"
            style={{
              ["--deg" as string]: "0deg",
              background:
                "conic-gradient(from -90deg, var(--color-accent-bright) 0deg, var(--color-accent-blue) var(--deg), rgba(255,255,255,0.1) var(--deg) 360deg)",
            }}
          >
            <div className="h-full w-full overflow-hidden rounded-full bg-bg p-[2px]">
              <img
                src={AVATAR_SRC}
                alt=""
                aria-hidden
                className="h-full w-full rounded-full object-cover"
                style={{ objectPosition: "center 18%" }}
              />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden" ref={wordWrapRef}>
          {/* ghost layer — always present at low opacity, sets the box's
              size so the reveal layer above has something to clip against */}
          <span aria-hidden className={`${WORD_CLASS} block text-ink/[0.08]`}>
            AKYRO
          </span>

          {/* reveal layer — clip-path grows in lockstep with the load
              counter, so the wordmark filling in IS the progress bar */}
          <div ref={revealRef} className="absolute inset-0" style={{ clipPath: "inset(0 100% 0 0)" }}>
            <span aria-hidden className={`${WORD_CLASS} chrome-text block`}>
              AKYRO
            </span>
            <div
              ref={sweepRef}
              className="absolute top-0 -left-1/3 h-full w-1/3 -skew-x-12"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                mixBlendMode: "overlay",
              }}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2.5">
          <div className="relative h-[2px] w-[180px] overflow-hidden rounded-full bg-white/10 sm:w-[220px]">
            <div
              ref={barFillRef}
              className="absolute inset-y-0 left-0 w-full origin-left overflow-hidden rounded-full"
              style={{
                transform: "scaleX(0)",
                background: "linear-gradient(90deg, var(--color-accent-bright), var(--color-accent-blue))",
              }}
            >
              <div
                aria-hidden
                className="absolute inset-y-0 -left-1/2 w-1/2 motion-safe:animate-[preloaderBarShimmer_1.1s_ease-in-out_infinite]"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)" }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-ink-dim">
            <span ref={numberRef}>000</span>
            <span>—</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* "ready" flash — a brief bright pulse marking the handoff to the site */}
      <div
        ref={flashRef}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 60% at 50% 46%, #ffffff, transparent 70%)", opacity: 0 }}
      />

      <Grain />

      <style jsx global>{`
        @keyframes preloaderGlowDriftA {
          0%,
          100% {
            transform: translate(-64%, -54%) scale(1);
          }
          50% {
            transform: translate(-58%, -58%) scale(1.12);
          }
        }
        @keyframes preloaderGlowDriftB {
          0%,
          100% {
            transform: translate(-34%, -44%) scale(1.08);
          }
          50% {
            transform: translate(-40%, -40%) scale(0.96);
          }
        }
        @keyframes preloaderGlowDriftC {
          0%,
          100% {
            transform: translate(-50%, -30%) scale(0.94);
          }
          50% {
            transform: translate(-50%, -36%) scale(1.1);
          }
        }
        @keyframes preloaderAvatarFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes preloaderGlowPulse {
          0%,
          100% {
            opacity: 0.55;
          }
          50% {
            opacity: 0.85;
          }
        }
        @keyframes preloaderBarShimmer {
          0% {
            transform: translateX(-20%);
          }
          100% {
            transform: translateX(220%);
          }
        }
        @keyframes preloaderSparkRise {
          0% {
            transform: translateY(0) scale(0.6);
            opacity: 0;
          }
          15% {
            opacity: 0.85;
          }
          85% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-46vh) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
