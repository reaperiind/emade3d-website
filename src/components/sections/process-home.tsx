"use client";

import { useI18n } from "@/i18n/provider";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProcessGrid } from "@/components/sections/process-steps";
import { Reveal } from "@/components/ui/reveal";

export function ProcessHomeSection() {
  const { t } = useI18n();
  return (
    <section className="section-pad bg-ink-900">
      <div className="container-site">
        <SectionHeading
          kicker={t.process.kicker}
          title={t.process.title}
          subtitle={t.process.subtitle}
          align="center"
        />
        <Reveal delay={200}>
          <div className="mt-12">
            <ProcessGrid />
          </div>
        </Reveal>
      </div>
    </section>
  );
}