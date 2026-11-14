import type { Translation } from "@/lib/i18n/translations";

export const AE_CAPABILITY_KEYS: (keyof Translation["software"]["ae"]["capabilities"])[] = [
  "motionGraphics",
  "compositing",
  "tracking",
  "typography",
  "vfx",
];

export const PR_CAPABILITY_KEYS: (keyof Translation["software"]["pr"]["capabilities"])[] = [
  "editing",
  "color",
  "sound",
  "story",
  "shortForm",
];
