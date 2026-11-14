// Palette/type tokens for the Approach section — deliberately close to (and
// partly re-exported from) the Hero's own local tokens, so the two sections
// read as one continuous scene rather than a hard cut to the site's generic
// `data-scene` tiers.

import { SKY_HIGH, SKY_TOP } from "../hero/constants";

export { VIOLET, VIOLET_LIGHT, BLUE, DISPLAY_FONT, HEADLINE_FONT, EASE_OUT, SKY_MID } from "../hero/constants";

// Darker than the sky's own mid-tones on purpose — same family (see
// hero/constants.ts SKY_*), but this section has no shader-lit clouds to
// carry contrast for it, so it leans toward the sky's darkest zenith tone.
export const BG = SKY_HIGH;
export const BG_DEEP = SKY_TOP;
export const TEXT = "#f5f5f7";
export const MUTED = "rgba(245,245,247,0.5)";

export const MONO_FONT =
  "var(--font-geist-mono), ui-monospace, monospace";
