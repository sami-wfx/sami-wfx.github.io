// Shared design tokens for the Hero — kept local rather than added to the
// global theme, since other sections' `data-scene` tiers already define
// their own bg/surface tokens and shouldn't shift when Hero's palette does.

// Byte-identical to globals.css's --color-bg default, so Hero's own
// painted background and the rest of the site's shared background are
// the exact same color everywhere, not just visually close.
// Re-sampled to match each new showreel render's own corner color —
// H.264 compression tends to shift near-black tones very slightly, so
// this value drifts by a few RGB units each time the source video
// changes. Current render ("сашаа") is 30fps (earlier ones were all
// 60fps) — half the decode throughput needed per second, which should
// meaningfully help if the reported playback stutter is a real-time
// decode bottleneck rather than a CSS-compositing one. Alpha channel
// (argb) flattened onto this exact hex at transcode time via ffmpeg
// overlay, crf 17 (~5.8Mbps) for visible quality. #020010 matches the
// actual H.264 output's corner. NOTE: the purple rounded-card backdrop
// is STILL baked into this render behind the character — unchanged,
// still needs fixing on the After Effects side (delete/hide that
// layer), alpha only ever affects the empty canvas around it.
export const BG = "#020010";
// Matches approach/constants.ts SKY_TOP exactly — Hero's background fades
// toward this at its bottom edge so the seam into Approach is invisible.
export const BG_DEEP = "#08041A";
export const TEXT = "#F5F3FF";
export const MUTED = "#918CA4";
export const VIOLET = "#8C63FF";
export const VIOLET_LIGHT = "#B18AFF";
export const BLUE = "#6D8CFF";

// Bold, rounded-geometric display face — matches a reference the user
// asked to match specifically for its font (very round terminals, soft
// strokes), not Unbounded's sharper/blockier character used before.
export const DISPLAY_FONT = "var(--font-nunito), 'Nunito', system-ui, sans-serif";

// Small-label face — pill badges (the headline sticker, the showreel's
// software chips), where a cleaner professional sans reads better than
// the rounded display face at 10-16px. Also doubles as the Hero body-copy
// face at weight 400 (description paragraph, demoted text link).
export const LABEL_FONT = "var(--font-inter), 'Inter', system-ui, sans-serif";

// Hero H1 only — dense/geometric, deliberately distinct from DISPLAY_FONT
// (Nunito), which Approach's own headline keeps using.
export const HEADLINE_FONT = "var(--font-unbounded), 'Unbounded', system-ui, sans-serif";

// Headline accent gradient — used via background-clip:text.
export const HEADLINE_GRADIENT = "linear-gradient(90deg, #8B7CFF 0%, #5B4BFF 100%)";

// Matches --ease-out-expo already used site-wide.
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/* ---------------------------------------------------------------
   A few tokens from the section's dusk-sky phase are kept because
   Approach's background still draws from them (see
   approach/constants.ts) — Hero itself no longer uses this palette,
   it went back to a plain violet field. Don't reintroduce the rest
   of that palette (SKY_LOW/SKY_BLUE/CLOUD_DARK/CLOUD_LIT/SKY_LIGHT)
   without a reason; they were shader uniforms for the WebGL sky,
   which no longer exists.
--------------------------------------------------------------- */

export const SKY_TOP = "#08041A";
export const SKY_HIGH = "#150C36";
export const SKY_MID = "#2A1760";
export const SKY_WARM = "#FF74A6";
export const CLOUD_WARM = "#FFB3CE";
