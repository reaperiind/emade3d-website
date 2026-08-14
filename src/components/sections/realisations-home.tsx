"use client";

import { useI18n } from "@/i18n/provider";
import { SectionHeading } from "@/components/ui/section-heading";
import { FeaturedProjects } from "@/components/sections/realisations-grid";

export function RealisationsHomeSection() {
  const { t } = useI18n();
  return (
    <section className="section-pad bg-ink-950">
      <div className="container-site">
        <SectionHeading
          kicker={t.realisations.kicker}
          title={t.realisations.title}
          subtitle={t.realisations.subtitle}
        />
        <FeaturedProjects />
      </div>
    </section>
  );
}