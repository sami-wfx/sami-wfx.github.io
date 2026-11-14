"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

export function ShowreelModal({
  open,
  onClose,
  src,
}: {
  open: boolean;
  onClose: () => void;
  src: string;
}) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.documentElement.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  useEffect(() => {
    const video = videoRef.current;
    if (!open || !video) return;
    video.currentTime = 0;
    video.play().catch(() => {});

    const onTime = () => {
      if (video.duration) setProgress(video.currentTime / video.duration);
    };
    const onError = () => setFailed(true);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("error", onError);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("error", onError);
      video.pause();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.showreel.headingLine1 + " " + t.showreel.headingLine2}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-sm"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={t.a11y.closeShowreel}
        className="absolute top-6 right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-white"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      <span className="absolute top-6 left-6 font-mono text-[11px] tracking-[0.2em] text-white/60 uppercase">
        ESC — {t.showreel.close}
      </span>

      <div className="relative aspect-video w-full max-w-[1500px] px-4">
        {!failed ? (
          <video
            ref={videoRef}
            src={src}
            playsInline
            muted={muted}
            onError={() => setFailed(true)}
            className="h-full w-full bg-black object-contain"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-surface">
            <span className="chrome-text text-4xl font-black tracking-tight sm:text-6xl">AKYRO</span>
            <span className="font-mono text-xs tracking-[0.2em] text-white/50 uppercase">
              {t.media.placeholder}
            </span>
          </div>
        )}

        {!failed && (
          <>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? t.showreel.unmute : t.showreel.mute}
              className="absolute right-4 bottom-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-white"
            >
              {muted ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M4 9v6h4l5 5V4L8 9H4Z" fill="currentColor" />
                  <path d="M16 9l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M4 9v6h4l5 5V4L8 9H4Z" fill="currentColor" />
                  <path d="M17 8a5 5 0 010 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              )}
            </button>

            <div className="absolute inset-x-0 -bottom-1 h-px bg-white/15">
              <div
                className="h-full bg-accent"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
