"use client";

import { BG, BG_DEEP } from "./constants";

/* ---------------------------------------------------------------
   Base fill — flat, muted, near-black violet, same --color-bg as the
   rest of the site (see globals.css). The grid is back a third time,
   but deliberately small this round — a tight radial mask that reads
   as roughly a fifth of the frame (behind the top of the text
   column), fading to fully transparent at its own edges, rather than
   spreading wide like the earlier attempts did. The other ~80% of
   Hero stays the flat fill with nothing on it. Bottom fade toward
   BG_DEEP stays — it's what makes the seam into Approach invisible,
   see approach/constants.ts SKY_TOP.
--------------------------------------------------------------- */

export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: BG }} />

      {/* faint grid, tightly masked to a small zone (~20% of the frame)
          behind the top-left of the text column, fully transparent past
          its own edge — not a wide wash across the section */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          WebkitMaskImage: "radial-gradient(32% 40% at 20% 32%, #000 25%, transparent 78%)",
          maskImage: "radial-gradient(32% 40% at 20% 32%, #000 25%, transparent 78%)",
        }}
      />

      {/* bottom fade toward BG_DEEP — the exact color Approach's own gradient
          starts at, so the section boundary reads as one continuous scene. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[26%]"
        style={{ background: `linear-gradient(180deg, transparent, ${BG_DEEP})` }}
      />
    </div>
  );
}
