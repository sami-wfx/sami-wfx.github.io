"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useAppReady } from "@/hooks/useAppReady";
import { useLanguage } from "@/hooks/useLanguage";
import { useIsTouchDevice } from "@/hooks/useMediaQuery";
import { useRafLoop } from "@/hooks/useRafLoop";
import { useCursorHover } from "@/hooks/useCursor";
import { clamp, cn, lerp } from "@/lib/utils";
import { withGlyphFallback } from "@/lib/withGlyphFallback";
import { Container } from "@/components/ui/Container";
import { HeroBackground } from "./hero/HeroBackground";
import { ShowreelCard } from "./hero/ShowreelCard";
import { StatNumber } from "./hero/StatNumber";
import { DISPLAY_FONT, HEADLINE_FONT, LABEL_FONT, HEADLINE_GRADIENT, EASE_OUT, MUTED } from "./hero/constants";

/* ---------------------------------------------------------------
   SAIVO — Hero v12 ("compact, one center")

   A composition pass on top of v11's structure, not a rewrite: one
   container (1180–1240px, not full-bleed), a tighter grid, a square
   showreel, and a proper per-word mask reveal for the headline. The
   entrance system stays split the same way it always has —
   page-load stagger (driven by `play`, runs once) is a separate
   layer from the locale-switch crossfade (driven by the `locale`
   key, replays every switch) — see HeadlineReveal/SwapText below.
--------------------------------------------------------------- */

// Detects "React has actually hydrated on the client" without the
// useState+useEffect idiom this project's lint config rejects (calling
// setState synchronously inside an effect body). useSyncExternalStore is
// the pattern React itself documents for "value differs between server
// and client, and must NOT change until after hydration" — the server
// snapshot and the client's very first snapshot both resolve to `false`
// (matching, so no hydration-mismatch warning), and only client renders
// after that ever see `true`. There's no real store to subscribe to
// (this value never changes again after mount), so `subscribe` is a
// permanent no-op.
function subscribeNever() {
  return () => {};
}
function getServerJsReady() {
  return false;
}
function getClientJsReady() {
  return true;
}
function useJsReady() {
  return useSyncExternalStore(subscribeNever, getClientJsReady, getServerJsReady);
}

const badgeReveal: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.97, filter: "blur(4px)" },
  show: (delay: number = 0) => ({ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.6, delay, ease: EASE_OUT } }),
};

// Sticker entrance (п.14): flies in rotated further than its resting -4deg
// and slightly small, spring-overshoots past the resting rotate/scale, then
// settles — the spring's own underdamped motion IS the overshoot, no manual
// keyframes needed. x/y carry the sticker's static offset (was a separate
// non-animated wrapper transform) since rotate is now animated too and it
// all has to live in one Framer-managed transform to avoid two writers
// fighting over the same CSS property.
// Used to be absolutely positioned over the headline's top-right corner
// (translate x/y against the H1's own box) — that broke twice in a row
// once an eyebrow line existed above the H1 too (the offset math was
// relative to the STICKER's own height, not the H1's, and got it wrong
// both times without a way to see the result). Normal document flow
// below the headline has no such magic numbers to get wrong: rotate is
// the only transform left, everything else is just margin.
const stickerReveal: Variants = {
  hidden: { opacity: 0, rotate: -22, scale: 0.9, filter: "blur(4px)" },
  show: {
    opacity: 1,
    rotate: -9,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 300, damping: 15, mass: 0.8, opacity: { duration: 0.3 }, filter: { duration: 0.3 } },
  },
};

const descReveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (delay: number) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: EASE_OUT } }),
};

const buttonReveal: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(2px)" },
  show: (delay: number) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, delay, ease: EASE_OUT } }),
};

const statReveal: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: (delay: number) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: EASE_OUT } }),
};

const swapVariants: Variants = {
  hidden: { opacity: 0, y: -8, filter: "blur(3px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3, ease: EASE_OUT } },
  exit: { opacity: 0, y: -8, filter: "blur(3px)", transition: { duration: 0.2, ease: EASE_OUT } },
};

/** Crossfades whole-phrase text on locale change; skipped on first mount
 *  (the page-load stagger elsewhere handles that), and skipped entirely
 *  under reduced motion (plain instant swap). */
function SwapText({
  text,
  className,
  style,
  uppercase = false,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  uppercase?: boolean;
}) {
  const { locale } = useLanguage();
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <span className={className} style={style}>
        {withGlyphFallback(text, uppercase)}
      </span>
    );
  }
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span key={locale} variants={swapVariants} initial="hidden" animate="show" exit="exit" className={className} style={style}>
        {withGlyphFallback(text, uppercase)}
      </motion.span>
    </AnimatePresence>
  );
}

/** Primary CTA (п.15): magnetic hover — the button drifts up to 8px toward
 *  the pointer (rAF+lerp, same pattern as MagneticButton.tsx and this
 *  section's own bg-glow drift), the glow intensifies, and the arrow
 *  nudges 3px via a plain CSS `group-hover` (a pseudo-class, so it doesn't
 *  care whether the button's own transform is JS- or CSS-driven).
 *  Position is written via the `translate` property, not `transform` —
 *  `active:scale-[0.98]` still uses `transform` on its own pseudo-class,
 *  and the two compose independently instead of one overwriting the other.
 *  Disabled under reduced motion / touch — glow and arrow hover feedback
 *  still work there since neither is the kind of motion reduced-motion
 *  users are opting out of. */
function MagneticCTA({
  href,
  text,
  icon,
  reduce,
  hoverProps,
}: {
  href: string;
  text: string;
  /** Small leading glyph (e.g. "▶") — kept outside SwapText so it doesn't
   *  re-crossfade on every locale switch, just the label next to it does. */
  icon?: string;
  reduce: boolean;
  hoverProps: ReturnType<typeof useCursorHover>;
}) {
  const isTouch = useIsTouchDevice();
  const wrapRef = useRef<HTMLDivElement>(null);
  const elRef = useRef<HTMLAnchorElement>(null);
  const raw = useRef({ x: 0, y: 0 });
  const eased = useRef({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const magneticActive = !reduce && !isTouch;

  useRafLoop(() => {
    eased.current.x = lerp(eased.current.x, raw.current.x, 0.18);
    eased.current.y = lerp(eased.current.y, raw.current.y, 0.18);
    if (elRef.current) {
      elRef.current.style.translate = `${eased.current.x.toFixed(1)}px ${eased.current.y.toFixed(1)}px`;
    }
  }, magneticActive);

  const onPointerMove = (e: React.PointerEvent) => {
    if (!magneticActive || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const relX = e.clientX - r.left - r.width / 2;
    const relY = e.clientY - r.top - r.height / 2;
    raw.current.x = clamp(relX * 0.3, -8, 8);
    raw.current.y = clamp(relY * 0.3, -8, 8);
  };
  const onPointerLeave = () => {
    raw.current.x = 0;
    raw.current.y = 0;
    setHovered(false);
  };

  return (
    <div
      ref={wrapRef}
      onPointerMove={onPointerMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={onPointerLeave}
    >
      <Link
        ref={elRef}
        href={href}
        {...hoverProps}
        className="group relative isolate flex w-full items-center justify-center gap-2.5 overflow-hidden px-[46px] text-[16px] font-bold tracking-[0.1em] uppercase transition-[box-shadow] duration-300 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          height: 68,
          borderRadius: 16,
          color: "#FFFFFF",
          background: "linear-gradient(90deg, #7B6BFF 0%, #4B3BE0 100%)",
          boxShadow: hovered ? "0 0 90px rgba(107,91,255,0.65)" : "0 0 60px rgba(107,91,255,0.45)",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)" }}
        />
        {icon && (
          <span aria-hidden className="relative z-10 text-[11px]">
            {icon}
          </span>
        )}
        <span className="relative z-10">
          <SwapText text={text} />
        </span>
        {!icon && (
          <span aria-hidden className="relative z-10 inline-block transition-transform duration-300 group-hover:translate-x-[3px]">
            ↗
          </span>
        )}
      </Link>
    </div>
  );
}

/** One headline phrase. On first load: word-by-word clip-path reveal
 *  (bottom-up + translateY(24px)->0, staggered 90ms/word). On every locale
 *  switch after that: a plain crossfade, same as SwapText — re-running the
 *  full stagger on every language click would be exactly the "restart the
 *  whole Hero animation" this section is meant to avoid.
 *
 *  The first-load reveal is deliberately NOT Framer-Motion-driven: Framer
 *  applies its `initial` state via inline style as soon as this component
 *  renders, including on the very first render — if hydration JS never
 *  finishes (blocked script, slow connection, disabled JS), the headline
 *  would stay stuck hidden forever. This is the page's LCP element, so
 *  instead the DEFAULT render (server HTML and first client paint, before
 *  any effect runs) has NO hidden state at all — plain visible text via a
 *  CSS class with `clip-path: inset(0)` — and only a `useEffect` (proof
 *  that JS actually ran) adds the "not yet revealed" class that the CSS
 *  transition then animates back out of once `play` flips to "show". */
function HeadlineReveal({
  text,
  play,
  baseDelay,
  uppercase,
  wordStyle,
}: {
  text: string;
  play: "hidden" | "show";
  baseDelay: number;
  uppercase: boolean;
  /** Extra style merged onto the innermost word span. Needed for the
   *  gradient (accent) phrase specifically: `clip-path` on any ancestor
   *  between a `background-clip: text` element and its glyphs breaks the
   *  clip (clip-path establishes its own stacking context, which isolates
   *  the text from the gradient-clipped background above it) — so the
   *  gradient has to live on the SAME element as the clip-path, not on an
   *  outer wrapper. */
  wordStyle?: React.CSSProperties;
}) {
  const { locale } = useLanguage();
  const reduce = useReducedMotion();
  // Derived-state-from-props pattern (see React docs: "Adjusting state when
  // a prop changes") rather than a ref — this project's lint config forbids
  // reading/writing ref.current during render entirely. `mountedLocale`
  // freezes at whatever locale was active on first render; the moment the
  // live `locale` diverges from it, `everSwitched` flips permanently.
  const [mountedLocale] = useState(locale);
  const [everSwitched, setEverSwitched] = useState(false);
  if (!everSwitched && locale !== mountedLocale) {
    setEverSwitched(true);
  }

  const jsReady = useJsReady();

  if (reduce) {
    return <span style={wordStyle}>{withGlyphFallback(text, uppercase)}</span>;
  }

  if (everSwitched) {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={locale} variants={swapVariants} initial="hidden" animate="show" exit="exit" style={wordStyle}>
          {withGlyphFallback(text, uppercase)}
        </motion.span>
      </AnimatePresence>
    );
  }

  // Visible by default (jsReady=false covers both SSR and the very first
  // client paint); only hidden once JS has confirmed it can also reveal it.
  const revealed = !jsReady || play === "show";
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <span key={i}>
          {i > 0 && " "}
          <span className="inline-block overflow-hidden" style={{ verticalAlign: "top" }}>
            <span
              className={`hero-word-reveal inline-block${revealed ? "" : " hero-word-reveal--hidden"}`}
              style={{ transitionDelay: `${baseDelay + i * 0.09}s`, ...wordStyle }}
            >
              {withGlyphFallback(word, uppercase)}
            </span>
          </span>
        </span>
      ))}
    </>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const appReady = useAppReady();
  const { t } = useLanguage();

  const scrollCueRef = useRef<HTMLDivElement>(null);
  const [stickerSettled, setStickerSettled] = useState(false);

  const play = reduce ? "show" : appReady ? "show" : "hidden";
  const portfolioHover = useCursorHover("view");
  const contactHover = useCursorHover("view");
  const initial = (v: string) => (reduce ? false : v);

  // No cursor-reactivity left in this section at all — the showreel's
  // parallax was the last of it and was removed by request (it should
  // stay completely still regardless of the pointer). The background
  // was already static before that.

  // Scroll cue (п.12) fades out permanently on the first scroll — a
  // one-shot listener with a direct style write, no re-render, matching
  // the ref-driven style everywhere else in this file.
  const scrollCueMount = (el: HTMLDivElement | null) => {
    scrollCueRef.current = el;
    if (!el || reduce) return;
    const onScroll = () => {
      el.style.opacity = "0";
    };
    window.addEventListener("scroll", onScroll, { once: true, passive: true });
  };

  return (
    <section id="top" className="relative flex flex-col overflow-hidden">
      <HeroBackground />

      {/* тот же Container, что у Navbar (1320px/40px) — логотип и заголовок
          выравниваются по одной вертикали. min-h+justify-center (lg): Hero
          scales up to fill more of a large desktop viewport instead of
          reading as a small block hugging the top — navbar itself stays
          `fixed` above, unaffected by this. */}
      <Container className="relative z-[1] flex flex-col pt-[110px] pb-[80px] lg:min-h-[760px] lg:justify-center lg:pt-[140px] lg:pb-[60px]">
          {/* lg grid track 2 is the EXACT same formula as ShowreelCard's own
              width below (clamp(320px,38vw,640px)) — the card can never be
              wider than its own track by construction. Track 1 carries an
              explicit minmax(480px, 1fr) floor as a hard guarantee the text
              column never goes below 480px; verified by hand this floor
              never actually has to bind at any of 1024/1280/1440/1920/2560px
              — the tightest real value is ~493px at 1024px — it's there as
              a backstop for widths in between, not the primary mechanism. */}
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(480px,1fr)_clamp(320px,38vw,640px)] lg:gap-[clamp(60px,6vw,100px)]">
          {/* ------------------------- текст ------------------------- */}
          <div className="order-1 min-w-0">
            {/* Badge is back overlapping the headline's corner — the last
                four attempts at this all broke because the badge kept
                colliding with the eyebrow line that used to sit directly
                above the first headline word. That eyebrow is gone now
                (removed per request), so the space above line 1 is just
                the Container's own top padding (110–166px) — plenty of
                room, no more collision source. Anchored to line 1
                specifically (not line 2) for exactly that reason. */}
            <h1
              className="relative uppercase [font-size:clamp(32px,10.5vw,125px)] lg:[font-size:clamp(72px,5vw,105px)]"
              style={{
                fontFamily: HEADLINE_FONT,
                fontWeight: 800,
                lineHeight: 0.92,
                letterSpacing: "-0.02em",
                overflowWrap: "break-word",
              }}
            >
              <span className="relative inline-block text-white" style={{ filter: "drop-shadow(0 8px 34px rgba(245,243,255,0.22))" }}>
                <HeadlineReveal text={t.hero.headline.primary} play={play} baseDelay={0.1} uppercase />

                {/* бейдж — abs positioned off THIS span (line 1), which
                    `useTilt`-style shrink-wraps via `inline-block` to the
                    word's own rendered width, so `right-0` hugs the actual
                    glyphs rather than the column's full width. */}
                <motion.div
                  data-hero-sticker
                  variants={stickerReveal}
                  initial={initial("hidden")}
                  animate={play}
                  onAnimationComplete={() => {
                    if (play === "show") setStickerSettled(true);
                  }}
                  className={cn(
                    "absolute right-0 z-[2] hidden w-fit items-center gap-3 rounded-[12px] sm:flex",
                    stickerSettled && "motion-safe:animate-[heroStickerWobble_5s_ease-in-out_infinite]"
                  )}
                  style={{
                    top: -50,
                    background: "linear-gradient(155deg, #A0DE2A 0%, #E4FF8A 46%, #8FCC1E 100%)",
                    boxShadow: "0 0 34px rgba(184,240,74,0.28), 0 10px 24px rgba(0,0,0,0.45), inset 0 1px 1px rgba(255,255,255,0.5)",
                    padding: "8px 16px 8px 8px",
                  }}
                >
                  {/* твоя реальная аватарка — public/images/avatar-icon.png;
                      пока её нет, просто не рендерим (не показываем битую
                      картинку) */}
                  <img
                    src="/images/avatar-icon.png"
                    alt=""
                    aria-hidden
                    className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                    style={{ background: "rgba(27,46,5,0.12)" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <span
                    className="flex flex-col"
                    style={{
                      color: "#1B2E05",
                      fontSize: 14,
                      lineHeight: 1.3,
                      fontWeight: 700,
                      fontFamily: LABEL_FONT,
                      letterSpacing: "0",
                      textTransform: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <SwapText text={t.hero.sticker.line1} />
                    <SwapText text={t.hero.sticker.line2} />
                  </span>
                </motion.div>
              </span>
              <span className="relative block">
                <HeadlineReveal
                  text={t.hero.headline.accent}
                  play={play}
                  baseDelay={0.18}
                  uppercase
                  wordStyle={{
                    backgroundImage: HEADLINE_GRADIENT,
                    backgroundSize: "180% 180%",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    filter: "drop-shadow(0 8px 30px rgba(137,93,255,0.18))",
                    animation: reduce ? undefined : "heroGradientShift 8s ease-in-out infinite alternate",
                  }}
                />
              </span>
            </h1>

            <motion.div
              variants={descReveal}
              custom={0.35}
              initial={initial("hidden")}
              animate={play}
              className="mt-[22px] flex max-w-[560px] flex-col gap-4"
            >
              {t.hero.description.map((paragraph, i) => (
                <p key={i} className="text-[18px] leading-[1.6]" style={{ color: "rgba(255,255,255,0.62)", fontFamily: LABEL_FONT, fontWeight: 400 }}>
                  <SwapText text={paragraph} />
                </p>
              ))}
            </motion.div>

            <div className="mt-[30px] flex flex-col items-start gap-4">
              <motion.div variants={buttonReveal} custom={0.43} initial={initial("hidden")} animate={play} className="w-full max-w-[420px]">
                <MagneticCTA href="#work" icon="▶" text={t.hero.ctaPortfolio} reduce={reduce} hoverProps={portfolioHover} />
              </motion.div>
              <motion.div variants={buttonReveal} custom={0.5} initial={initial("hidden")} animate={play}>
                <Link
                  href="#contact"
                  {...contactHover}
                  className="group inline-flex items-center gap-1.5 text-[13px] transition-colors duration-300 hover:text-white"
                  style={{ color: "rgba(255,255,255,0.45)", fontFamily: LABEL_FONT, fontWeight: 400 }}
                >
                  <SwapText text={t.hero.ctaContact} />
                  <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-[3px]">
                    ↗
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* ------------------- showreel ------------------- */}
          <div className="order-2 flex justify-center">
            <ShowreelCard play={play} />
          </div>
        </div>

        {/* stats — читается как продолжение левого блока, divider на всю
            ширину контейнера, но не улетает в отдельную пустую зону.
            Статус — простой текст с зелёной точкой НАД разделителем (п.6),
            без pill-фона; цифры статистики отдельной строкой под ним. */}
        <motion.div
          variants={badgeReveal}
          custom={0.5}
          initial={initial("hidden")}
          animate={play}
          className="mt-[40px] flex items-center gap-2.5 lg:mt-[52px]"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="absolute inline-flex h-full w-full rounded-full motion-safe:animate-[heroStatusPulse_2s_ease-in-out_infinite]"
              style={{ background: "#B8F04A" }}
            />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: "#B8F04A" }} />
          </span>
          <span className="font-mono text-[11px] tracking-[0.14em] uppercase" style={{ color: MUTED }}>
            <SwapText text={t.hero.status} uppercase />
          </span>
        </motion.div>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-3 gap-y-2 border-t pt-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <motion.div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {t.hero.stats.map((s, i) => (
              // Keyed by position, not the (locale-dependent) label — a stable
              // key keeps StatNumber mounted across a locale switch, so its
              // count-up doesn't restart from zero every time the text swaps.
              <motion.span
                key={i}
                variants={statReveal}
                custom={0.56 + i * 0.06}
                initial={initial("hidden")}
                animate={play}
                className={cn("flex items-center gap-3", i === 2 && "max-lg:basis-full")}
              >
                {i > 0 && (
                  <span
                    aria-hidden
                    className={cn("inline-block h-4 w-px", i === 2 && "max-lg:hidden")}
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  />
                )}
                <span className="flex items-baseline gap-2">
                  <span
                    className="text-[38px] leading-none font-extrabold"
                    style={{
                      fontFamily: DISPLAY_FONT,
                      color: "#FFFFFF",
                      WebkitTextStroke: "0.5px rgba(0,0,0,0.35)",
                    }}
                  >
                    <StatNumber value={s.value} start={play === "show"} delayMs={700} />
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.12em] uppercase" style={{ color: MUTED, opacity: 0.55 }}>
                    {s.label}
                  </span>
                </span>
              </motion.span>
            ))}
          </motion.div>

          {/* scroll cue (п.12) — inline at the end of Hero's own content
              rather than pinned to the viewport edge, since this section's
              height is content-driven, not a fixed 100svh (see grid above);
              an absolutely-positioned cue could float detached from it. */}
          <div
            ref={scrollCueMount}
            aria-hidden
            className="hidden items-center gap-2 pb-0.5 opacity-90 transition-opacity duration-500 lg:flex"
          >
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.7)" }}>
              <SwapText text={t.hero.scrollCue} uppercase />
            </span>
            <span aria-hidden className="inline-block h-3 w-px" style={{ background: "rgba(255,255,255,0.4)" }} />
          </div>
        </div>
      </Container>

      <style jsx global>{`
        /* Заголовок (п.13): видим по умолчанию (SSR/без JS/до гидратации) —
           .hero-word-reveal без модификатора равен inset(0), никакого
           translateY. Скрытое состояние — только через --hidden, который
           React добавляет исключительно из useEffect (доказательство, что
           JS реально выполнился). */
        .hero-word-reveal {
          clip-path: inset(0% 0 0% 0);
          transform: translateY(0);
          transition: clip-path 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hero-word-reveal--hidden {
          clip-path: inset(0% 0 100% 0);
          transform: translateY(24px);
        }
        @keyframes heroStickerWobble {
          0%, 100% { transform: rotate(-9deg); }
          25% { transform: rotate(-10.5deg); }
          75% { transform: rotate(-7.5deg); }
        }
        @keyframes heroStatusPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes heroGradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  );
}
