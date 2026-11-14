import type { Metadata } from "next";
import { Geist, Geist_Mono, Archivo_Black, Noto_Sans, Nunito, Inter, Unbounded } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { translations } from "@/lib/i18n/translations";
import { CursorProvider } from "@/hooks/useCursor";
import { AppReadyProvider } from "@/hooks/useAppReady";
import { LanguageProvider } from "@/hooks/useLanguage";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Preloader } from "@/components/Preloader";
import { Grain } from "@/components/ui/Grain";
import { Vignette } from "@/components/ui/Vignette";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The Hero wordmark's display face — same family as the 3D chrome "S" accent,
// so the DOM typography and the WebGL object read as one consistent brand mark.
const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

// The Hero/Approach headline's display face — bold, rounded-geometric
// (very round terminals, soft strokes), matching a reference the user
// asked to match specifically for its font, not just its layout.
const nunito = Nunito({
  variable: "--font-nunito",
  weight: ["800", "900"],
  subsets: ["latin", "cyrillic"],
});

// Small-label face for pill badges, and — at weight 400 — the Hero body
// copy (description paragraph, demoted text link): a cleaner, more
// neutral professional sans than Geist reads better there.
const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "600", "700", "800"],
  subsets: ["latin", "cyrillic"],
});

// Hero's own headline face — dense/geometric, replacing Nunito's rounder
// terminals specifically for the H1 (Approach's headline stays on Nunito,
// via DISPLAY_FONT — this is a Hero-only swap, see hero/constants.ts
// HEADLINE_FONT).
const unbounded = Unbounded({
  variable: "--font-unbounded",
  weight: ["800"],
  subsets: ["latin", "cyrillic"],
});

// General-purpose safety net: withGlyphFallback.tsx wraps any rare
// Cyrillic character a display face is missing (e.g. Ӣ/ӣ) in this font
// specifically, since Noto Sans is designed for exhaustive Unicode
// coverage. Not tied to any one primary face — kept regardless of which
// display font is active.
const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  weight: ["700", "800", "900"],
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
});

const ruMeta = translations.ru.meta;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: ruMeta.title,
    template: `%s — ${SITE.name}`,
  },
  description: ruMeta.description,
  keywords: [
    "видеомонтаж",
    "motion design",
    "After Effects",
    "Premiere Pro",
    "видеомонтажёр",
    "motion designer",
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE.url,
    title: ruMeta.title,
    description: ruMeta.description,
    siteName: SITE.name,
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: ruMeta.title,
    description: ruMeta.description,
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#070812",
  colorScheme: "dark" as const,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} ${archivoBlack.variable} ${notoSans.variable} ${nunito.variable} ${inter.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg text-ink">
        <LanguageProvider>
          <AppReadyProvider>
            <CursorProvider>
              <SmoothScroll>
                <Preloader />
                <Grain />
                <Vignette />
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </SmoothScroll>
            </CursorProvider>
          </AppReadyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
