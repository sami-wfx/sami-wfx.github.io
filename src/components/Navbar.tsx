"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconBrandInstagram, IconBrandTelegram } from "@tabler/icons-react";
import { NAV_LINKS } from "@/data/nav";
import { Container } from "@/components/ui/Container";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/hooks/useLanguage";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const EASE = [0.28, 0, 0.16, 1] as const;

const SOCIALS = [
  { href: SITE.instagram, label: "Instagram", Icon: IconBrandInstagram },
  { href: SITE.telegram, label: "Telegram", Icon: IconBrandTelegram },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);
  const { t } = useLanguage();
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active-section indicator: whichever nav target section currently
  // crosses the viewport's vertical center gets marked active. A generous
  // rootMargin band (rather than threshold tuning) means it doesn't
  // flicker between two sections at their shared boundary. Guarded to
  // never fire while still near the very top of the page (in Hero, which
  // isn't itself a nav target) — an IntersectionObserver's first callback
  // reports each target's state as of the moment it starts observing, and
  // without this guard a tall/short section further down the page could
  // occasionally register as "already intersecting" on that very first
  // batch, lighting up a nav link before the user has scrolled at all.
  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.querySelector(l.href)).filter((el): el is Element => el !== null);
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (window.scrollY < 80) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveHref(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // `overflow: hidden` on <html> alone doesn't stop scroll on iOS Safari —
  // rubber-band/momentum scrolling still moves the page under a `fixed`
  // overlay, which is exactly what let the Software section bleed through
  // the open mobile menu. Pinning the body at its current scroll offset
  // (and restoring it on close) is the reliable cross-browser fix.
  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    if (!menuOpen) return;

    const scrollY = window.scrollY;
    const { body } = document;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      document.documentElement.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [menuOpen]);

  // Cascade top-down on mount: logo, each nav item, then the right-side
  // cluster, each 0.06s after the previous.
  const cascade = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: -10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: i * 0.06, ease: EASE },
        };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled
          ? "border-b border-[rgba(255,255,255,0.06)] bg-[rgba(5,5,10,0.65)] backdrop-blur-[18px]"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav aria-label={t.a11y.primaryNav}>
        <Container className="flex h-[76px] items-center justify-between gap-6">
          <motion.div {...cascade(0)}>
            <Link href="#top" className="text-xl font-black tracking-tight text-ink" aria-label={t.a11y.home}>
              AKYRO
            </Link>
          </motion.div>

          <ul className="hidden items-center gap-9 lg:flex">
            {NAV_LINKS.map((link, i) => {
              const active = activeHref === link.href;
              return (
                <motion.li key={link.href} {...cascade(i + 1)}>
                  <Link
                    href={link.href}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "group/nav relative inline-block py-1 text-[14px] font-medium tracking-[0.16em] uppercase transition-colors duration-300 hover:text-[#B8F04A]",
                      active ? "text-white" : "text-[rgba(255,255,255,0.62)]"
                    )}
                  >
                    <span className="inline-block transition-transform duration-300 group-hover/nav:-translate-y-0.5">
                      {t.nav[link.key]}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-0 -bottom-0.5 h-[1.5px] origin-left transition-transform duration-[450ms] ease-[cubic-bezier(0.28,0,0.16,1)] group-hover/nav:scale-x-100",
                        active ? "scale-x-100" : "scale-x-0"
                      )}
                      style={{ background: "#B8F04A" }}
                    />
                  </Link>
                </motion.li>
              );
            })}
          </ul>

          <motion.div {...cascade(NAV_LINKS.length + 1)} className="flex items-center gap-5">
            <LanguageSwitcher className="hidden sm:flex sm:mr-4" />

            <div className="hidden items-center gap-2.5 lg:flex">
              {SOCIALS.map(({ href, label, Icon }, i) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.18)] text-white/70 transition-[translate,rotate,border-color,background-color,box-shadow,color] duration-300 hover:-translate-y-[3px] hover:border-[rgba(196,169,255,0.75)] hover:bg-[rgba(150,120,255,0.18)] hover:text-white hover:shadow-[0_8px_22px_rgba(139,92,255,0.4)] ${
                    i % 2 === 0 ? "hover:rotate-[3deg]" : "hover:rotate-[-3deg]"
                  }`}
                >
                  <Icon size={17} stroke={1.75} />
                </a>
              ))}
            </div>

            <Link
              href="#contact"
              className="hidden rounded-xl px-7 py-3.5 text-[13px] font-semibold tracking-[0.1em] text-white uppercase transition-colors duration-300 hover:bg-[rgba(255,255,255,0.06)] lg:inline-flex lg:items-center"
              style={{
                background: "transparent",
                border: "0.5px solid rgba(255,255,255,0.2)",
              }}
            >
              {t.nav.cta}
            </Link>

            <button
              type="button"
              className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? t.a11y.closeMenu : t.a11y.openMenu}
            >
              <span
                className={cn(
                  "h-px w-5 bg-ink transition-transform duration-300",
                  menuOpen && "translate-y-[3px] rotate-45"
                )}
              />
              <span
                className={cn(
                  "h-px w-5 bg-ink transition-transform duration-300",
                  menuOpen && "-translate-y-[3px] -rotate-45"
                )}
              />
            </button>
          </motion.div>
        </Container>
      </nav>

      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col justify-center overflow-y-auto bg-bg px-[clamp(20px,4vw,72px)] py-24 transition-[clip-path] duration-500 ease-[var(--ease-out-expo)] lg:hidden",
          menuOpen ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(0_0_100%_0)]"
        )}
      >
        <ul className="flex flex-col gap-6">
          {NAV_LINKS.map((link, i) => (
            <li
              key={link.href}
              style={{ transitionDelay: menuOpen ? `${i * 60 + 100}ms` : "0ms" }}
              className={cn(
                "overflow-hidden transition-all duration-500",
                menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}
            >
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-baseline gap-4 text-4xl font-black tracking-tight text-ink sm:text-5xl"
              >
                <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                {t.nav[link.key]}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-col gap-8">
          <MagneticButton href="#contact" onClick={() => setMenuOpen(false)}>
            {t.nav.cta} ↗
          </MagneticButton>
          <div className="flex items-center gap-4">
            {SOCIALS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.18)] text-white/70"
              >
                <Icon size={18} stroke={1.75} />
              </a>
            ))}
          </div>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
