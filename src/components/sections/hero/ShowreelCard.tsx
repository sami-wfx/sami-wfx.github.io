"use client";

import { motion } from "framer-motion";
import { useCursorHover } from "@/hooks/useCursor";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { BG } from "./constants";

/* ---------------------------------------------------------------
   No card anymore — no background, no border, no box-shadow, no
   border-radius, no overflow-hidden. `object-contain` (not `cover`)
   so the character is never cropped.

   Color-matching --color-bg to the video's sampled corner color (see
   constants.ts BG) closes most of the gap, but H.264 compression adds
   ~1-2/255 of per-frame noise even on a "flat" near-black background —
   physically impossible to null out with one static hex value. That
   tiny noise is invisible where it's *gradual*, but the video is
   object-contain inside a taller (4:5) box, so on a square (1:1)
   source there's a hard horizontal cut where the video's own pixels
   stop and the page background shows through (letterboxed above/below
   at ~10% each, since 1:1 content in a 4:5 box is width-constrained).
   A hard edge makes even a 1-unit color difference readable as a
   line — human vision keys off edges, not absolute color distance.

   Fix: an inner box sized to the video's own aspect ratio (1/1, not
   the outer 4:5 layout box) so the feather strips below sit exactly
   on the video's real rendered edge instead of guessing. Two hairline
   (3% of that inner box) gradients, BG fading to transparent, painted
   only at its top/bottom. This is NOT the wide vignette/overlay that
   was rejected earlier (that was ~40% of the frame and looked like an
   obvious frame) — this is thin enough to be imperceptible as an
   "effect" while still erasing the hard-edge seam. Left/right have no
   feather: contain fills the inner box's full width with no gap there.
   Still a plain overlay <div>, not a mask on the <video> element
   itself, so it doesn't touch hardware decode (masking the video was
   tried even earlier and caused measured mobile lag).

   No cursor reactivity on this card anymore either — no tilt, no
   hover-lift, no parallax (that whole mechanism, and the `parallaxRef`
   prop that carried it, was removed from Hero.tsx too). It stays
   completely still regardless of the pointer, per request. The only
   entrance effect left is the outer opacity/y/scale mount animation —
   no `filter: blur()` and no clip-path anymore. Both were removed for
   the same reason: framer-motion leaves the settled value
   (`blur(0px)`, `inset(0% 0% 0% 0%)`) in the inline style permanently
   rather than clearing it once the transition finishes, and an
   ancestor with `filter` or `clip-path` applied — even a technically
   no-op value — pushes Chromium off the zero-copy hardware video path
   into software readback/composite. Same mechanism that made
   mask-image on the video itself lag earlier in this project. That's
   what caused the reported "video plays like 0.8x/dropped frames" —
   not a decode/bitrate problem, an ancestor-compositing one.
--------------------------------------------------------------- */

export function ShowreelCard({ play }: { play: "hidden" | "show" }) {
  const reduce = useReducedMotion();
  const cursorHover = useCursorHover("play");

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 26, scale: 0.96 }}
      animate={play === "show" ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 26, scale: 0.96 }}
      transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto w-full sm:w-[min(100%,840px)] lg:mx-0 lg:w-[clamp(320px,38vw,640px)]"
      style={{ aspectRatio: "4 / 5" }}
    >
      {/* Stays motionless on hover/cursor by request — no tilt, no
          hover-lift, and (per request) no "Play showreel" hover label
          either, so there's nothing left needing a `group` wrapper. */}
      <div className="relative flex h-full w-full items-center justify-center">
        <div {...cursorHover} className="relative w-full" style={{ aspectRatio: "1 / 1" }}>
          {/* no background/border/shadow/radius, overflow left at the
              browser default (visible) — sized to the video's own 1:1
              aspect (not the outer 4:5 layout box), so it fills this
              box exactly with no letterbox gap anywhere */}
          <video
            className="h-full w-full object-cover"
            src="/videos/showreel.mp4"
            poster="/images/reel-poster.jpg"
            style={{ background: BG }}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
          />

          {/* hairline feather absorbing H.264 compression noise right at
              the video's real top/bottom edge — see comment above */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[6%]"
            style={{ background: `linear-gradient(${BG}, transparent)` }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[6%]"
            style={{ background: `linear-gradient(transparent, ${BG})` }}
          />
          {/* same on the left/right edges: any tiny colour difference between the
              decoded video and the page background becomes a soft gradient
              instead of a visible square edge */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-[6%]"
            style={{ background: `linear-gradient(90deg, ${BG}, transparent)` }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-[6%]"
            style={{ background: `linear-gradient(270deg, ${BG}, transparent)` }}
          />
        </div>
      </div>
    </motion.div>
  );
}
