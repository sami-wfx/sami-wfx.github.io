"use client";

import { useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { RevealText } from "@/components/ui/RevealText";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ShowreelModal } from "@/components/ui/ShowreelModal";
import { useLanguage } from "@/hooks/useLanguage";

const SHOWREEL_SRC = "/videos/showreel.mp4";

export function Showreel() {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section id="showreel" data-scene="deep" className="relative overflow-hidden px-[clamp(20px,4vw,72px)] py-24 sm:py-32">
      <div className="mx-auto max-w-[1700px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <SectionLabel index={t.showreel.index}>{t.showreel.eyebrow}</SectionLabel>
          <SectionLabel>{t.showreel.tagLine}</SectionLabel>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-[clamp(56px,13vw,220px)] leading-[0.86] font-black tracking-tighter uppercase">
            <RevealText as="span" className="block" gradient>
              {t.showreel.headingLine1}
            </RevealText>
            <RevealText as="span" className="block" delay={0.08} gradient>
              {t.showreel.headingLine2}
            </RevealText>
          </h2>
          <div className="flex flex-col items-end gap-2 pb-2">
            <span className="font-mono text-sm tracking-[0.15em] text-accent uppercase">
              {t.showreel.duration}
            </span>
            <span className="font-mono text-[11px] tracking-[0.15em] text-ink-faint uppercase">
              00:00 / 01:00
            </span>
          </div>
        </div>

        <div className="mt-10">
          <MediaFrame
            src={SHOWREEL_SRC}
            label="AKYRO"
            playOnHover={false}
            autoPlay
            showPlayButton
            cursorLabel="play"
            onActivate={() => setModalOpen(true)}
            className="aspect-video w-full"
          >
            <div className="pointer-events-none absolute inset-0 flex items-end justify-between p-6 sm:p-8">
              <span className="font-mono text-xs tracking-[0.2em] text-ink/80 uppercase">
                {t.showreel.eyebrow}
              </span>
              <span className="font-mono text-xs tracking-[0.2em] text-ink/80 uppercase">
                {t.showreel.index}
              </span>
            </div>
          </MediaFrame>
          <div className="relative mt-4 h-px w-full overflow-hidden bg-line">
            <span className="absolute inset-y-0 left-0 w-[15%] bg-gradient-to-r from-accent to-accent-blue" />
          </div>
        </div>
      </div>

      <ShowreelModal open={modalOpen} onClose={() => setModalOpen(false)} src={SHOWREEL_SRC} />
    </section>
  );
}
