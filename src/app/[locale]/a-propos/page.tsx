import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/sections/page-hero";
import { CtaSection } from "@/components/sections/cta-section";
import { Reveal } from "@/components/ui/reveal";
import { LogoMark, CheckIcon, RulerCompassIcon, CogIcon } from "@/components/ui/icons";
import { DevisCta } from "@/components/ui/devis-cta";

export function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Metadata {
  const dict = getDictionary(params.locale);
  return buildMetadata({
    locale: params.locale,
    dict,
    page: "about",
    pathname: "/a-propos",
  });
}

export default function AboutPage({ params }: { params: { locale: Locale } }) {
  const dict = getDictionary(params.locale);

  return (
    <>
      <PageHero
        kicker={dict.about.kicker}
        title={dict.about.title}
        subtitle={dict.about.intro}
      />

      {/* intro band */}
      <section className="section-pad bg-ink-950">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
          <Reveal>
            <p className="text-muted text-xl leading-relaxed sm:text-2xl">
              {dict.about.lead}
            </p>
          </Reveal>
          <div className="space-y-3">
            {dict.about.points.map((point, i) => (
              <Reveal key={i} delay={i * 70}>
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
                  <CheckIcon className="h-4 w-4 shrink-0 text-accent" />
                  <span className="text-sm text-steel-200">{point}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* pillars */}
      <section className="section-pad bg-ink-900">
        <div className="container-site">
          <div className="grid gap-5 md:grid-cols-3">
            {dict.about.pillars.map((pillar, i) => {
              const keys = ["conception", "impression", "fabrication"] as const;
              const iconKey = keys[i];
              return (
                <Reveal key={pillar.title} delay={i * 90}>
                  <div className="card group relative h-full overflow-hidden p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40">
                    <span className="absolute end-5 top-4 font-display text-6xl font-bold text-white/[0.05]">
                      0{i + 1}
                    </span>
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/30 bg-accent-dim text-accent">
                      <DynamicIcon name={iconKey} className="h-6 w-6" />
                    </span>
                    <h2 className="mt-6 font-display text-2xl font-semibold text-white">
                      {pillar.title}
                    </h2>
                    <p className="text-muted mt-3 leading-relaxed">{pillar.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* audiences + values */}
      <section className="section-pad bg-ink-950">
        <div className="container-site grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <span className="kicker">{dict.about.sectionTitle}</span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="h-display mt-4 text-3xl sm:text-4xl">
                {dict.about.sectionTitle}
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="text-muted mt-5 text-lg leading-relaxed">
                {dict.about.sectionText}
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-8 rounded-xl border border-white/10 bg-ink-800/50 p-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest2 text-steel-400">
                  {dict.about.audiencesTitle}
                </h3>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {dict.about.audiences.map((audience) => (
                    <li
                      key={audience}
                      className="flex items-center gap-2.5 text-sm text-steel-200"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {audience}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t border-white/10 pt-5">
                  <DevisCta size="md" />
                </div>
              </div>
            </Reveal>
          </div>

          <div>
            <Reveal>
              <span className="kicker">{dict.about.valuesTitle}</span>
            </Reveal>
            <div className="mt-8 space-y-4">
              {dict.about.values.map((value, i) => (
                <Reveal key={value.title} delay={i * 80}>
                  <div className="card flex items-start gap-4 p-5">
                    <span className="font-display text-sm font-bold tracking-widest text-accent">
                      0{i + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-white">
                        {value.title}
                      </h3>
                      <p className="text-muted mt-1 text-sm leading-relaxed">
                        {value.text}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}

function DynamicIcon({
  name,
  className,
}: {
  name: "conception" | "impression" | "fabrication";
  className?: string;
}) {
  if (name === "conception") return <LogoMark className={className} />;
  if (name === "impression") return <RulerCompassIcon className={className} />;
  return <CogIcon className={className} />;
}