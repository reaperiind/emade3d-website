"use client";

import { useI18n } from "@/i18n/provider";
import { Reveal } from "@/components/ui/reveal";
import { SparkIcon, CheckIcon } from "@/components/ui/icons";

export function SolutionSection() {
  const { t } = useI18n();

  return (
    <section className="section-pad bg-ink-950">
      <div className="container-site grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        <div>
          <Reveal>
            <span className="kicker">{t.solution.kicker}</span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="h-display mt-4 text-3xl text-balance sm:text-4xl lg:text-[2.75rem]">
              {t.solution.title}
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-muted mt-6 text-lg leading-relaxed">
              {t.solution.lead}
            </p>
          </Reveal>
        </div>

        <div className="flex flex-col">
          <div className="grid gap-4">
            {t.solution.points.map((point, i) => (
              <Reveal key={i} delay={i * 90}>
                <div className="card group relative overflow-hidden p-5 transition-colors duration-300 hover:border-accent/30">
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent-dim text-accent">
                      <SparkIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-semibold text-white">
                        {point.title}
                      </h3>
                      <p className="text-muted mt-1.5 text-sm leading-relaxed">
                        {point.text}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={320}>
            <div className="mt-5 flex items-start gap-3 rounded-lg border border-accent/25 bg-accent-dim/60 p-4">
              <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <p className="text-sm font-medium leading-relaxed text-steel-100">
                {t.solution.note}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
