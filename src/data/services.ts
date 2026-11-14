import type { Translation } from "@/lib/i18n/translations";

export const SERVICE_KEYS: (keyof Translation["services"]["items"])[] = [
  "videoEditing",
  "motionDesign",
  "shortForm",
  "commercial",
];
