import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo";
import { localized } from "@/lib/localize";
import { services, expandingCapabilities } from "@/data/services";
import type { ServiceIconKey } from "@/data/services";
import { PageHero } from "@/components/sections/page-hero";
import { CtaSection } from "@/components/sections/cta-section";
import { Reveal } from "@/components/ui/reveal";
import { CheckIcon, ArrowUpRightIcon } from "@/components/ui/icons";
import {
  PenToolIcon,
  Printer3dIcon,
  CogIcon,
  FlaskIcon,
  WrenchIcon,
  MoldIcon,
} from "@/components/ui/icons";

const ICONS: Record<ServiceIconKey, React.ComponentType<{ className?: string }>> = {
  conception: PenToolIcon,
  impression: Printer3dIcon,
  fabrication: CogIcon,
  prototypage: FlaskIcon,
  outillage: WrenchIcon,
  moules: MoldIcon,
};

export function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Metadata {
  const dict = getDictionary(params.locale);
  return buildMetadata({
    locale: params.locale,
    dict,
    page: "services",
    pathname: "/services",
  });
}

export default function ServicesPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const { locale } = params;
  const dict = getDictionary(locale);

  return (
    <>
      <PageHero
        kicker={dict.services.kicker}
        title={dict.services.title}
        subtitle={dict.services.subtitle}
      />

      {/* anchor sub-nav */}
      <div className="sticky top-16 z-30 border-y border-white/10 bg-ink-950/90 backdrop-blur-md">
        <nav
          aria-label={dict.services.kicker}
          className="container-site flex gap-2 overflow-x-auto py-3"
        >
          {services.map((service) => (
            <a
              key={service.id}
              href={`#${service.id}`}
              className="whitespace-nowrap rounded-full border border-white/12 px-3.5 py-1.5 text-xs font-medium text-steel-300 transition hover:border-accent/50 hover:text-accent"
            >
              {localized(service.title, locale)}
            </a>
          ))}
        </nav>
      </div>

      {/* detailed service blocks */}
      <div className="divide-y divide-white/5 bg-ink-950">
        {services.map((service, i) => {
          const Icon = ICONS[service.icon];
          const flip = i % 2 === 1;
          return (
            <section
              key={service.id}
              id={service.id}
              className={flip ? "bg-ink-900" : "bg-ink-950"}
            >
              <div className="container-site section-pad grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
                <Reveal>
                  <div className={flip ? "lg:order-2" : ""}>
                    <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-accent/30 bg-accent-dim text-accent">
                      <Icon className="h-7 w-7" />
                    </span>
                    <span className="mt-6 block font-display text-sm font-bold tracking-widest text-accent">
                      0{i + 1} — {dict.services.kicker}
                    </span>
                    <h2 className="h-display mt-3 text-3xl sm:text-4xl">
                      {localized(service.title, locale)}
                    </h2>
                    <p className="text-muted mt-5 text-base leading-relaxed sm:text-lg">
                      {localized(service.description, locale)}
                    </p>
                    <p className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-steel-300">
                      <ArrowUpRightIcon className="h-4 w-4 text-accent" />
                      {localized(service.process, locale)}
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={120} className={flip ? "lg:order-1" : ""}>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {service.points.map((point) => (
                      <li
                        key={point.fr}
                        className="card flex items-start gap-3 p-4 transition-colors hover:border-accent/30"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-dim text-accent">
                          <CheckIcon className="h-3 w-3" />
                        </span>
                        <span className="text-sm leading-relaxed text-steel-200">
                          {localized(point, locale)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </section>
          );
        })}
      </div>

      {/* expansion roadmap — future services are data-driven */}
      <section className="section-pad bg-ink-900">
        <div className="container-site">
          <Reveal>
            <span className="kicker">{dict.services.fromIdea}</span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="h-display mt-4 max-w-2xl text-3xl sm:text-4xl">
              {dict.services.futureTitle}
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="text-muted mt-4 max-w-2xl text-lg">
              {dict.services.futureSubtitle}
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {expandingCapabilities.map((cap, i) => (
              <Reveal key={cap.id} delay={i * 60}>
                <div className="card flex items-center justify-between gap-4 p-5">
                  <div>
                    <h3 className="font-display text-base font-semibold text-white">
                      {localized(cap.label, locale)}
                    </h3>
                    <p className="text-muted mt-1 text-sm">
                      {localized(cap.description, locale)}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-accent/30 bg-accent-dim px-3 py-1 text-xs font-semibold text-accent">
                    <span
                      className={`h-1.5 w-1.5 rounded-full bg-accent ${
                        cap.ready ? "animate-pulse" : ""
                      }`}
                    />
                    {dict.services.futureStatus}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}