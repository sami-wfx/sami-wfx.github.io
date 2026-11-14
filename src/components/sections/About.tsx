"use client";

import { RevealText } from "@/components/ui/RevealText";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Portrait } from "@/components/ui/Portrait";
import { useLanguage } from "@/hooks/useLanguage";

export function About() {
  const { t } = useLanguage();

  const meta = [
    { label: t.about.metaBasedInLabel, value: t.about.metaBasedInValue },
    { label: t.about.metaAvailableLabel, value: t.about.metaAvailableValue },
    { label: t.about.metaFocusLabel, value: t.about.metaFocusValue },
  ];

  return (
    <section id="about" data-scene="raised" className="px-[clamp(20px,4vw,72px)] py-28 sm:py-36">
      <div className="mx-auto grid max-w-[1700px] grid-cols-1 gap-14 md:grid-cols-[1fr_1fr] md:items-center md:gap-20">
        <div className="order-2 md:order-1">
          <Portrait alt={t.about.portraitAlt} placeholder={t.about.portraitPlaceholder} />
        </div>

        <div className="order-1 md:order-2">
          <SectionLabel index={t.about.index}>{t.about.eyebrow}</SectionLabel>
          <h2 className="mt-4 text-[clamp(40px,7vw,120px)] leading-[0.92] font-black tracking-tight text-ink uppercase">
            <RevealText as="span" className="block">
              {t.about.headingLine1}
            </RevealText>
            <RevealText as="span" className="block" delay={0.06}>
              {t.about.headingLine2}
            </RevealText>
          </h2>

          <RevealText as="p" className="mt-8 max-w-lg text-xl leading-snug text-ink-dim sm:text-2xl">
            {t.about.text}
          </RevealText>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-faint">{t.about.text2}</p>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-faint">{t.about.text3}</p>
          <p className="mt-6 font-mono text-xs tracking-[0.15em] text-accent uppercase">
            <span className="text-ink-faint">{t.software.eyebrow}: </span>
            {t.about.tagline}
          </p>

          <dl className="mt-12 grid grid-cols-1 gap-6 border-t border-line pt-8 sm:grid-cols-3">
            {meta.map((m) => (
              <div key={m.label}>
                <dt className="font-mono text-[10px] tracking-[0.2em] text-ink-faint uppercase">
                  {m.label}
                </dt>
                <dd className="mt-1 text-sm text-ink">{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
