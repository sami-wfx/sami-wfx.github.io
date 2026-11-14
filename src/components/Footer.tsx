"use client";

import { useLenis } from "lenis/react";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Footer() {
  const { t } = useLanguage();
  const lenis = useLenis();

  const scrollToTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1700px] flex-col items-start justify-between gap-6 px-[clamp(20px,4vw,72px)] py-10 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 2 L22 7 L22 17 L12 22 L2 17 L2 7 Z"
              stroke="currentColor"
              strokeOpacity="0.5"
              strokeWidth="1"
            />
            <path d="M8 12 L11 15 L16 9" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          <div className="text-xs leading-tight text-ink-dim">
            <p className="text-ink">
              {SITE.name} © {new Date().getFullYear()}
            </p>
            <p>{t.footer.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <LanguageSwitcher />
          <p className="hidden font-mono text-[11px] tracking-[0.15em] text-ink-faint uppercase sm:block">
            {t.footer.madeWith}
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="group flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] text-ink-dim uppercase transition-colors duration-300 hover:text-ink"
          >
            {t.footer.backToTop}
            <span className="transition-transform duration-300 group-hover:-translate-y-1">↑</span>
          </button>
        </div>
      </div>

      <div aria-hidden className="relative h-[9vw] min-h-[56px] overflow-hidden select-none">
        <span className="chrome-text absolute -top-[2vw] left-1/2 -translate-x-1/2 text-[16vw] leading-none font-black tracking-tighter whitespace-nowrap">
          AKYRO
        </span>
      </div>
    </footer>
  );
}
