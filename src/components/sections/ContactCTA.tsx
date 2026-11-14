"use client";

import { useState } from "react";
import { RevealText } from "@/components/ui/RevealText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

export function ContactCTA() {
  const { t } = useLanguage();
  const [hovered, setHovered] = useState<string | null>(null);

  const links = [
    { label: t.contact.telegram, href: SITE.telegram },
    { label: t.contact.instagram, href: SITE.instagram },
  ];

  return (
    <section id="contact" data-scene="deep" className="relative overflow-hidden px-[clamp(20px,4vw,72px)] py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 30%, rgba(115,87,255,0.14) 0%, rgba(71,118,255,0.06) 45%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span
          className={cn(
            "text-[16vw] leading-none font-black tracking-tighter text-accent/20 uppercase transition-all duration-500 ease-[var(--ease-out-quart)]",
            hovered ? "scale-100 opacity-100" : "scale-95 opacity-0"
          )}
        >
          {hovered}
        </span>
      </div>

      <div className="relative mx-auto max-w-[1700px]">
        <SectionLabel index={t.contact.index}>{t.contact.eyebrow}</SectionLabel>

        <div className="mt-6">
          <RevealText
            as="h2"
            className="text-[clamp(44px,10vw,168px)] leading-[0.9] font-black tracking-tight text-ink uppercase"
          >
            {t.contact.heading1}
          </RevealText>
          <RevealText
            as="h2"
            className="text-[clamp(44px,10vw,168px)] leading-[0.9] font-black tracking-tight text-ink uppercase"
            delay={0.08}
          >
            {t.contact.heading2}
          </RevealText>
          <RevealText
            as="h2"
            gradient
            className="text-[clamp(44px,10vw,168px)] leading-[0.9] font-black tracking-tight uppercase"
            delay={0.16}
          >
            {t.contact.heading3}
          </RevealText>
        </div>

        <div className="mt-14 flex flex-col items-start gap-14 md:flex-row md:items-end md:justify-between">
          <MagneticButton href={`mailto:${SITE.email}`}>{t.contact.cta} ↗</MagneticButton>

          <ul className="flex flex-wrap gap-x-10 gap-y-4">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setHovered(link.label)}
                  onMouseLeave={() => setHovered(null)}
                  className="text-sm tracking-[0.1em] text-ink-dim uppercase transition-colors duration-300 hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${SITE.email}`}
                onMouseEnter={() => setHovered(t.contact.email)}
                onMouseLeave={() => setHovered(null)}
                className="text-sm tracking-[0.1em] text-ink-dim uppercase transition-colors duration-300 hover:text-ink"
              >
                {t.contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
