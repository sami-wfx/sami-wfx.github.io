"use client";

import { useRef } from "react";
import Link from "next/link";
import { cn, lerp } from "@/lib/utils";
import { useRafLoop } from "@/hooks/useRafLoop";
import { useIsTouchDevice } from "@/hooks/useMediaQuery";

type MagneticButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
};

export function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  className,
}: MagneticButtonProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const elRef = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const target = useRef({ x: 0, y: 0, scale: 1 });
  const current = useRef({ x: 0, y: 0, scale: 1 });
  const isTouch = useIsTouchDevice();

  useRafLoop(() => {
    current.current.x = lerp(current.current.x, target.current.x, 0.16);
    current.current.y = lerp(current.current.y, target.current.y, 0.16);
    current.current.scale = lerp(current.current.scale, target.current.scale, 0.14);
    if (elRef.current) {
      elRef.current.style.transform = `translate(${current.current.x.toFixed(2)}px, ${current.current.y.toFixed(2)}px) scale(${current.current.scale.toFixed(3)})`;
    }
  }, !isTouch);

  const handleMove = (e: React.PointerEvent) => {
    if (isTouch || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    target.current.x = relX * 0.35;
    target.current.y = relY * 0.5;
  };

  const updateFillOrigin = (e: React.PointerEvent) => {
    if (!wrapRef.current || !fillRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const ox = ((e.clientX - rect.left) / rect.width) * 100;
    const oy = ((e.clientY - rect.top) / rect.height) * 100;
    fillRef.current.style.transformOrigin = `${ox}% ${oy}%`;
  };

  const handleEnter = (e: React.PointerEvent) => {
    target.current.scale = 1.045;
    updateFillOrigin(e);
  };

  const handleLeave = (e: React.PointerEvent) => {
    target.current.x = 0;
    target.current.y = 0;
    target.current.scale = 1;
    updateFillOrigin(e);
  };

  const isPrimary = variant === "primary";

  const content = isPrimary ? (
    <span className="relative z-10">{children}</span>
  ) : (
    <>
      <span
        ref={fillRef}
        aria-hidden
        className="absolute inset-0 scale-0 rounded-full bg-ink transition-transform duration-500 ease-out group-hover:scale-150 group-focus-visible:scale-150"
      />
      <span className="relative z-10 transition-colors duration-300 group-hover:text-bg group-focus-visible:text-bg">
        {children}
      </span>
    </>
  );

  const sharedClassName = cn(
    "group relative isolate inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-4 text-xs font-semibold tracking-[0.15em] uppercase transition-[background-color,opacity] duration-300 will-change-transform",
    isPrimary ? "bg-ink text-bg hover:opacity-85" : "border border-ink/35 text-ink",
    className
  );

  const sharedProps = {
    className: sharedClassName,
    onPointerMove: handleMove,
    onPointerEnter: handleEnter,
    onPointerLeave: handleLeave,
  };

  return (
    <div ref={wrapRef} className="inline-block">
      {href ? (
        <Link
          ref={elRef as React.Ref<HTMLAnchorElement>}
          href={href}
          onClick={onClick}
          {...sharedProps}
        >
          {content}
        </Link>
      ) : (
        <button
          ref={elRef as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={onClick}
          {...sharedProps}
        >
          {content}
        </button>
      )}
    </div>
  );
}
