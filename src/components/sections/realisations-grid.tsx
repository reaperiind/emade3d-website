"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { projects, getCategoryMeta, type Project } from "@/data/projects";
import { localized } from "@/lib/localize";
import { ProjectVisual } from "@/components/visual/project-visual";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export function ProjectCard({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  const { locale, t } = useI18n();
  const cat = getCategoryMeta(project.category);

  return (
    <Link
      href={`/${locale}/realisations/${project.slug}`}
      className={cn(
        "card group block overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card-lg",
        className
      )}
    >
      <div className="relative overflow-hidden">
        <ProjectVisual
          visual={cat?.visual ?? "printer"}
          label={project.title[locale]}
          className="aspect-[4/3] overflow-hidden rounded-b-none transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute start-4 top-4 rounded-full border border-white/10 bg-ink-950/80 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {localized(cat?.label ?? {}, locale)}
        </span>
        {project.year && (
          <span className="absolute end-4 top-4 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-ink-950">
            {project.year}
          </span>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-display text-lg font-semibold text-white transition-colors group-hover:text-accent-soft">
          {localized(project.title, locale)}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-steel-400">
          {localized(project.summary, locale)}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
          {t.common.viewProject}
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function FeaturedProjects() {
  const { locale, t } = useI18n();
  const featured = projects.filter((p) => p.featured).slice(0, 3);

  return (
    <div className="mt-12 grid gap-6 md:grid-cols-3">
      {featured.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
      <Link
        href={`/${locale}/realisations`}
        className="btn-outline-accent btn-md mt-2 md:col-span-3 md:justify-self-center"
      >
        {t.common.viewAll}
      </Link>
    </div>
  );
}
