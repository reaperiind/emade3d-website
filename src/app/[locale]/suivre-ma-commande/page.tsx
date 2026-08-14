import type { Metadata } from "next";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo";
import { localized } from "@/lib/localize";
import { services } from "@/data/services";
import { processSteps } from "@/data/process";
import { PageHero } from "@/components/sections/page-hero";
import { TrackForm } from "@/components/sections/track-form";
import { Reveal } from "@/components/ui/reveal";
import {
  ArrowRightIcon,
  PlusIcon,
  ClockIcon,
} from "@/components/ui/icons";

export function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Metadata {
  const dict = getDictionary(params.locale);
  return buildMetadata({
    locale: params.locale,
    dict,
    page: "track",
    pathname: "/suivre-ma-commande",
  });
}

export default function SuivreMaCommandePage({
  params,
}: {
  params: { locale: Locale };
}) {
  const { locale } = params;
  const dict = getDictionary(locale);
  const track = dict.track;
  const q = dict.quote;

  return (
    <>
      <PageHero kicker={track.kicker} title={track.title} subtitle={track.subtitle} />

      <section className="section-pad bg-ink-950">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-14">
          {/* Form */}
          <Reveal delay={120} className="lg:order-2">
            <TrackForm />
          </Reveal>

          {/* Sidebar */}
          <div className="space-y-4 lg:order-1">
            <Reveal delay={160}>
              <div className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
                  <ClockIcon className="h-5 w-5 text-accent" />
                  {dict.process.title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {processSteps.map((step) => (
                    <li key={step.id} className="flex items-start gap-2.5">
                      <span className="mt-0.5 font-display text-sm font-bold text-accent">
                        {step.number}
                      </span>
                      <span className="text-sm leading-relaxed text-steel-200">
                        {localized(step.title, locale)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="card rounded-xl border-white/10 p-6">
                <h2 className="font-display text-lg font-semibold text-white">
                  {q.servicesHint}
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {services.map((service) => (
                    <Link
                      key={service.id}
                      href={`/${locale}/services#${service.id}`}
                      className="btn-outline btn-sm"
                    >
                      {localized(service.title, locale)}
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0}>
              <div className="card rounded-xl border-white/10 p-6">
                <h2 className="font-display text-lg font-semibold text-white">
                  {track.helpTitle}
                </h2>
                <p className="text-muted mt-2 text-sm leading-relaxed">
                  {track.helpText}
                </p>
                <div className="mt-5 flex flex-col gap-2.5">
                  <Link
                    href={`/${locale}/demander-un-devis`}
                    className="btn-primary btn-md w-full justify-between"
                  >
                    <span>{track.helpNewOrder}</span>
                    <PlusIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/${locale}/faq`}
                    className="btn-outline-accent btn-md w-full justify-between"
                  >
                    <span>{track.helpFaq}</span>
                    <ArrowRightIcon className="h-4 w-4 rtl:rotate-180" />
                  </Link>
                  <Link
                    href={`/${locale}/contact`}
                    className="btn-outline btn-md w-full justify-between"
                  >
                    <span>{track.helpContact}</span>
                    <ArrowRightIcon className="h-4 w-4 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}