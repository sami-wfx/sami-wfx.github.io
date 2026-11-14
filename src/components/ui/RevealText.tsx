"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

type Tag = "div" | "h1" | "h2" | "h3" | "h4" | "p" | "span";

type RevealTextProps = {
  children: string;
  as?: Tag;
  className?: string;
  stagger?: number;
  delay?: number;
  start?: string;
  /** Apply the chrome gradient directly on each word span — background-clip:text
   *  is unreliable when the gradient is declared on an ancestor of nested,
   *  overflow-hidden mask wrappers, so this keeps gradient + glyphs on one element. */
  gradient?: boolean;
};

export function RevealText({
  children,
  as = "div",
  className,
  stagger = 0.035,
  delay = 0,
  start = "top 88%",
  gradient = false,
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!ref.current) return;
    const targets = ref.current.querySelectorAll<HTMLElement>("[data-reveal-item]");

    if (reducedMotion) {
      gsap.set(targets, { yPercent: 0, opacity: 1 });
      return;
    }

    gsap.set(targets, { yPercent: 110 });
    const tween = gsap.to(targets, {
      yPercent: 0,
      duration: 1.1,
      stagger,
      delay,
      ease: "expo.out",
      scrollTrigger: { trigger: ref.current, start, once: true },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reducedMotion, stagger, delay, start]);

  const words = children.split(" ");
  const content = words.map((word, i) => (
    <span key={i}>
      <span className="inline-block overflow-hidden align-top pb-[0.08em]">
        <span
          data-reveal-item
          className={cn("inline-block will-change-transform", gradient && "chrome-text")}
        >
          {word}
        </span>
      </span>
      {i < words.length - 1 ? " " : ""}
    </span>
  ));

  switch (as) {
    case "h1":
      return (
        <h1 ref={ref as React.Ref<HTMLHeadingElement>} className={className}>
          {content}
        </h1>
      );
    case "h2":
      return (
        <h2 ref={ref as React.Ref<HTMLHeadingElement>} className={className}>
          {content}
        </h2>
      );
    case "h3":
      return (
        <h3 ref={ref as React.Ref<HTMLHeadingElement>} className={className}>
          {content}
        </h3>
      );
    case "h4":
      return (
        <h4 ref={ref as React.Ref<HTMLHeadingElement>} className={className}>
          {content}
        </h4>
      );
    case "p":
      return (
        <p ref={ref as React.Ref<HTMLParagraphElement>} className={className}>
          {content}
        </p>
      );
    case "span":
      return (
        <span ref={ref as React.Ref<HTMLSpanElement>} className={className}>
          {content}
        </span>
      );
    default:
      return (
        <div ref={ref as React.Ref<HTMLDivElement>} className={className}>
          {content}
        </div>
      );
  }
}
