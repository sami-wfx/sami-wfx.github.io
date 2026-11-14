"use client";

import { PROJECTS } from "@/data/projects";
import { ProjectItem } from "@/components/sections/ProjectItem";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { RevealText } from "@/components/ui/RevealText";
import { useLanguage } from "@/hooks/useLanguage";

export function SelectedWork() {
  const { t } = useLanguage();

  return (
    <section id="work" data-scene="raised" className="px-[clamp(20px,4vw,72px)] pt-28 pb-16 sm:pt-36">
      <div className="mx-auto max-w-[1700px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel index={t.work.index}>{t.work.eyebrow}</SectionLabel>
            <h2 className="mt-4 text-[clamp(44px,9vw,160px)] leading-[0.9] font-black tracking-tight text-ink uppercase">
              <RevealText as="span" className="block">
                {t.work.headingLine1}
              </RevealText>
              <RevealText as="span" className="block" delay={0.06}>
                {t.work.headingLine2}
              </RevealText>
            </h2>
          </div>
        </div>

        <div className="mt-8">
          {PROJECTS.map((project, i) => (
            <ProjectItem key={project.id} project={project} index={i} reversed={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
