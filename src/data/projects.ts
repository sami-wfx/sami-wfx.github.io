import type { Translation } from "@/lib/i18n/translations";

type CategoryKey = keyof Translation["work"]["categories"];
type ServiceKey = keyof Translation["work"]["serviceTags"];

export type Project = {
  id: string;
  title: string;
  categoryKey: CategoryKey;
  year: string;
  serviceKeys: ServiceKey[];
  software: string[];
  /** Optional preview clip — drop a file at this path and it plays on hover. */
  videoSrc?: string;
  /** Vertical (9:16) clips get a narrower, phone-proportioned frame instead of the default widescreen one. */
  orientation?: "landscape" | "vertical";
};

// Placeholder projects — swap title/category/media for real work.
// Drop hover-preview clips in /public/videos/ and thumbnails in /public/images/.
export const PROJECTS: Project[] = [
  {
    id: "midnight-run",
    title: "Midnight Run",
    categoryKey: "shortFilm",
    year: "2026",
    serviceKeys: ["editing", "color", "soundDesign"],
    software: ["Premiere Pro", "After Effects"],
    videoSrc: "/videos/project-01.mp4",
  },
  {
    id: "northline",
    title: "Northline",
    categoryKey: "commercial",
    year: "2025",
    serviceKeys: ["motionGraphics", "compositing", "color"],
    software: ["After Effects", "Premiere Pro"],
    videoSrc: "/videos/project-02.mp4",
  },
  {
    id: "glasswave",
    title: "Glasswave",
    categoryKey: "musicVideo",
    year: "2025",
    serviceKeys: ["editing", "vfx", "typography"],
    software: ["After Effects", "Premiere Pro"],
    videoSrc: "/videos/project-03.mp4",
  },
  {
    id: "field-notes",
    title: "Field Notes",
    categoryKey: "social",
    year: "2025",
    serviceKeys: ["shortFormEditing", "captions", "motionGraphics"],
    software: ["Premiere Pro", "After Effects"],
    videoSrc: "/videos/project-04.mp4",
    orientation: "vertical",
  },
];
