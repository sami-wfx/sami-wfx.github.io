"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useCursor, type CursorLabel } from "@/hooks/useCursor";
import { useTilt } from "@/hooks/useTilt";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useLanguage } from "@/hooks/useLanguage";

type MediaFrameProps = {
  src?: string;
  label: string;
  className?: string;
  playOnHover?: boolean;
  autoPlay?: boolean;
  cursorLabel?: CursorLabel;
  tilt?: boolean;
  revealOnScroll?: boolean;
  /** Renders a large centered play control. By default toggles inline playback;
   *  pass `onActivate` to trigger something else (e.g. open a fullscreen modal). */
  showPlayButton?: boolean;
  onActivate?: () => void;
  children?: React.ReactNode;
};

export function MediaFrame({
  src,
  label,
  className,
  playOnHover = true,
  autoPlay = false,
  cursorLabel = "play",
  tilt = false,
  revealOnScroll = true,
  showPlayButton = false,
  onActivate,
  children,
}: MediaFrameProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(autoPlay);
  const { setLabel } = useCursor();
  const { t } = useLanguage();
  const showVideo = Boolean(src) && !failed;
  const { ref: tiltRef, onPointerMove: onTiltMove, onPointerLeave: onTiltLeave } = useTilt(6, tilt);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Media error events don't always reach React's onError reliably for
    // elements whose src errors immediately on mount, so listen natively too.
    if (video.error) {
      setFailed(true);
      return;
    }
    const handleError = () => setFailed(true);
    video.addEventListener("error", handleError);
    return () => video.removeEventListener("error", handleError);
  }, [src]);

  useEffect(() => {
    if (!revealOnScroll || !tiltRef.current) return;
    const el = tiltRef.current;

    if (reducedMotion) {
      gsap.set(el, { autoAlpha: 1, scale: 1, filter: "blur(0px)" });
      return;
    }

    gsap.set(el, { autoAlpha: 0, scale: 1.08, filter: "blur(14px)" });
    const tween = gsap.to(el, {
      autoAlpha: 1,
      scale: 1,
      filter: "blur(0px)",
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, revealOnScroll]);

  const togglePlay = () => {
    if (onActivate) {
      onActivate();
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <div
      ref={tiltRef}
      className={cn(
        "group/media relative isolate overflow-hidden rounded-[20px] bg-surface [transform-style:preserve-3d] will-change-transform",
        className
      )}
      onPointerEnter={() => setLabel(cursorLabel)}
      onPointerLeave={() => {
        setLabel(null);
        if (tilt) onTiltLeave();
        if (playOnHover && !showPlayButton && videoRef.current) videoRef.current.pause();
      }}
      onPointerMove={(e) => {
        if (tilt) onTiltMove(e);
        if (playOnHover && !showPlayButton && videoRef.current && videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        }
      }}
      onClick={showPlayButton ? togglePlay : undefined}
      role={showPlayButton ? "button" : undefined}
      aria-label={showPlayButton ? t.showreel.playLabel : undefined}
    >
      {showVideo && (
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          autoPlay={autoPlay}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-quart)] group-hover/media:scale-[1.025]"
        />
      )}

      {!showVideo && (
        <div className="absolute inset-0 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-surface-2 via-surface to-black p-6">
          <div
            aria-hidden
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-transform duration-1000 group-hover/media:translate-x-full"
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.06]"
            style={{
              background:
                "radial-gradient(60% 55% at 70% 30%, rgba(115,87,255,0.4), transparent 70%)",
            }}
          />
          <span className="font-mono text-[10px] tracking-[0.2em] text-ink-faint uppercase">
            {t.media.placeholder}
          </span>
          <p className="chrome-text text-2xl font-black tracking-tight sm:text-3xl">{label}</p>
        </div>
      )}

      {tilt && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: "var(--glare-o, 0)",
            background:
              "radial-gradient(480px circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.14), transparent 60%)",
            mixBlendMode: "overlay",
          }}
        />
      )}

      {showPlayButton && showVideo && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span
            aria-hidden
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-full border border-ink/50 bg-bg/40 backdrop-blur-sm transition-all duration-500 ease-[var(--ease-out-quart)] sm:h-24 sm:w-24",
              playing ? "scale-90 opacity-0 group-hover/media:opacity-100" : "scale-100 opacity-100"
            )}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M8 5v14l11-7z" fill="currentColor" className="text-ink" />
            </svg>
          </span>
        </div>
      )}

      {children}
    </div>
  );
}
