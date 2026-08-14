"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { services, type ServiceIconKey } from "@/data/services";
import { localized } from "@/lib/localize";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { ArrowRightIcon } from "@/components/ui/icons";
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

function ServiceCard({ index }: { index: number }) {
  const { locale, t } = useI18n();
  const service = services[index];
  const Icon = ICONS[service.icon];

  return (
    <Reveal delay={index * 70} className="h-full">
      <Link
        href={`/${locale}/services#${service.id}`}
        className="card group flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card-lg"
      >
        <div className="flex items-start justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/30 bg-accent-dim text-accent transition-transform duration-300 group-hover:-translate-y-0.5">
            <Icon className="h-6 w-6" />
          </span>
          <span className="font-display text-xs font-semibold tracking-widest text-steel-500">
            0{index + 1}
          </span>
        </div>

        <h3 className="mt-5 font-display text-xl font-semibold text-white">
          {localized(service.title, locale)}
        </h3>
        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-steel-400">
          {localized(service.short, locale)}
        </p>

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
          {t.services.explore}
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
        </span>
      </Link>
    </Reveal>
  );
}

export function ServicesGrid({ compact }: { compact?: boolean }) {
  const { locale, t } = useI18n();
  return (
    <section className="section-pad bg-ink-900">
      <div className="container-site">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            kicker={t.services.kicker}
            title={t.services.title}
            subtitle={t.services.subtitle}
          />
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <ServiceCard key={s.id} index={i} />
          ))}
        </div>

        {compact && (
          <div className="mt-10 text-center">
            <Link
              href={`/${locale}/services`}
              className="btn-outline-accent btn-md"
            >
              {t.services.viewAll}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
