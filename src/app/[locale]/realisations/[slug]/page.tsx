import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo";
import { localized } from "@/lib/localize";
import {
  projects,
  getProjectBySlug,
  getCategoryMeta,
} from "@/data/projects";
import { ProjectVisual } from "@/components/visual/project-visual";
import { CtaSection } from "@/components/sections/cta-section";
import { Reveal } from "@/components/ui/reveal";
import { DevisCta } from "@/components/ui/devis-cta";
import {
  CheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  WrenchIcon,
  CogIcon,
  RulerCompassIcon,
} from "@/components/ui/icons";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { locale: Locale; slug: string };
}): Metadata {
  const { locale, slug } = params;
  const dict = getDictionary(locale);
  const project = getProjectBySlug(slug);
  if (!project) return {};

  return buildMetadata({
    locale,
    dict,
    page: "realisations",
    pathname: `/realisations/${slug}`,
    title: `${localized(project.title, locale)} — Emade3D`,
    description: localized(project.summary, locale),
  });
}

const META_ICONS = [RulerCompassIcon, CogIcon, WrenchIcon, CheckIcon];

export default function ProjectDetailPage({
  params,
}: {
  params: { locale: Locale; slug: string };
}) {
  const { locale, slug } = params;
  const dict = getDictionary(locale);
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  const cat = getCategoryMeta(project.category)!;
  const index = projects.findIndex((p) => p.slug === slug);
  const prev = projects[index - 1] ?? projects[projects.length - 1];
  const next = projects[(index + 1) % projects.length];

  const sections = [
    { title: dict.realisations.problem, text: localized(project.problem, locale) },
    { title: dict.realisations.solution, text: localized(project.solution, locale) },
    { title: dict.realisations.method, text: localized(project.method, locale) },
    { title: dict.realisations.result, text: localized(project.result, locale) },
  ];

  return (
    <>
      {/* header */}
      <section className="relative overflow-hidden bg-ink-950">
        <div aria-hidden className="technical-grid absolute inset-0 mask-fade-b" />
        <div className="container-site relative pb-14 pt-32 sm:pt-40">
          <Reveal>
            <Link
              href={`/${locale}/realisations`}
              className="inline-flex items-center gap-2 text-sm font-medium text-steel-400 transition hover:text-accent"
            >
              <ArrowLeftIcon className="h-4 w-4 rtl:rotate-180" />
              {dict.common.backToProjects}
            </Link>
          </Reveal>
          <Reveal delay={80}>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-accent/40 bg-accent-dim px-3.5 py-1.5 text-xs font-semibold text-accent">
                {localized(cat.label, locale)}
              </span>
              {project.year && (
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-steel-300">
                  {project.year}
                </span>
              )}
            </div>
          </Reveal>
          <Reveal delay={140}>
            <h1 className="h-display mt-5 max-w-3xl text-4xl text-balance sm:text-5xl lg:text-6xl">
              {localized(project.title, locale)}
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-muted mt-6 max-w-2xl text-lg leading-relaxed">
              {localized(project.summary, locale)}
            </p>
          </Reveal>
        </div>
      </section>

      {/* body */}
      <section className="section-pad bg-ink-950">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          {/* visual + meta */}
          <div>
            <Reveal>
              <div className="lg:sticky lg:top-24">
                <ProjectVisual
                  visual={cat.visual}
                  label={localized(project.title, locale)}
                  className="aspect-[4/3]"
                />
                <dl className="mt-6 grid grid-cols-2 gap-3">
                  <div className="card p-4">
                    <dt className="text-[11px] uppercase tracking-widest text-steel-500">
                      {dict.common.method}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-white">
                      {localized(cat.label, locale)}
                    </dd>
                  </div>
                  <div className="card p-4">
                    <dt className="text-[11px] uppercase tracking-widest text-steel-500">
                      {dict.common.duration}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-white">
                      {localized(project.duration, locale)}
                    </dd>
                  </div>
                  <div className="card p-4">
                    <dt className="text-[11px] uppercase tracking-widest text-steel-500">
                      {dict.common.requestedBy}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-white">
                      {localized(project.client, locale)}
                    </dd>
                  </div>
                  <div className="card p-4">
                    <dt className="text-[11px] uppercase tracking-widest text-steel-500">
                      Année
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-white">
                      {project.year}
                    </dd>
                  </div>
                </dl>
              </div>
            </Reveal>
          </div>

          {/* story */}
          <div className="space-y-6">
            {sections.map((section, i) => {
              const Icon = META_ICONS[i] ?? CheckIcon;
              return (
                <Reveal key={section.title} delay={i * 70}>
                  <div className="card p-6 sm:p-7">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent-dim text-accent">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h2 className="font-display text-xl font-semibold text-white">
                        {section.title}
                      </h2>
                    </div>
                    <p className="text-muted mt-4 leading-relaxed">
                      {section.text}
                    </p>
                  </div>
                </Reveal>
              );
            })}

            <Reveal delay={320}>
              <div className="flex flex-col items-start justify-between gap-5 rounded-xl border border-accent/25 bg-accent-dim p-6 sm:p-7 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-display text-lg font-semibold text-white">
                    {dict.cta.title}
                  </h3>
                  <p className="text-muted mt-1 text-sm">{dict.cta.lead}</p>
                </div>
                <DevisCta size="md" className="shrink-0" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* prev / next */}
      <section className="border-t border-white/10 bg-ink-900">
        <div className="container-site grid gap-px overflow-hidden sm:grid-cols-2">
          <Link
            href={`/${locale}/realisations/${prev.slug}`}
            className="group flex items-center gap-4 p-6 transition hover:bg-white/[0.03] sm:p-8"
          >
            <ArrowLeftIcon className="h-5 w-5 shrink-0 text-accent rtl:rotate-180" />
            <div>
              <p className="text-[11px] uppercase tracking-widest text-steel-500">
                {dict.common.prevProject}
              </p>
              <p className="mt-1 font-display text-base font-semibold text-white transition group-hover:text-accent-soft">
                {localized(prev.title, locale)}
              </p>
            </div>
          </Link>
          <Link
            href={`/${locale}/realisations/${next.slug}`}
            className="group flex items-center justify-end gap-4 p-6 text-end transition hover:bg-white/[0.03] sm:p-8"
          >
            <div>
              <p className="text-[11px] uppercase tracking-widest text-steel-500">
                {dict.common.nextProject}
              </p>
              <p className="mt-1 font-display text-base font-semibold text-white transition group-hover:text-accent-soft">
                {localized(next.title, locale)}
              </p>
            </div>
            <ArrowRightIcon className="h-5 w-5 shrink-0 text-accent rtl:rotate-180" />
          </Link>
        </div>
      </section>

      <CtaSection />
    </>
  );
}