"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { getCategoryMeta, type Project } from "@/data/projects";
import { localized } from "@/lib/localize";
import { ProjectVisual } from "@/components/visual/project-visual";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const MEDIA_URL = (key: string) => `/api/media/${key}`;

export function ProjectCard({
  project,
  className,
  onImageClick,
}: {
  project: Project;
  className?: string;
  onImageClick?: () => void;
}) {
  const { locale, t } = useI18n();
  const cat = getCategoryMeta(project.category);
  const cover = project.images?.[0];

  const coverContent = (
    <div className="relative overflow-hidden">
      <ProjectVisual
        visual={cat?.visual ?? "printer"}
        label={project.title[locale]}
        imageSrc={cover ? MEDIA_URL(cover) : null}
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
      {onImageClick && cover && (
        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="rounded-full border border-white/20 bg-ink-950/70 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
            Agrandir
          </span>
        </span>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "card group block overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card-lg",
        className
      )}
    >
      {onImageClick && cover ? (
        <button
          type="button"
          onClick={onImageClick}
          aria-label={`Agrandir : ${localized(project.title, locale)}`}
          className="block w-full text-start"
        >
          {coverContent}
        </button>
      ) : (
        <Link href={`/${locale}/realisations/${project.slug}`}>{coverContent}</Link>
      )}

      <div className="p-6">
        <h3 className="font-display text-lg font-semibold text-white transition-colors group-hover:text-accent-soft">
          <Link href={`/${locale}/realisations/${project.slug}`}>
            {localized(project.title, locale)}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-steel-400">
          {localized(project.summary, locale)}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
          <Link href={`/${locale}/realisations/${project.slug}`}>
            {t.common.viewProject}
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </Link>
        </span>
      </div>
    </div>
  );
}

export function FeaturedProjects() {
  const { locale, t } = useI18n();
  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && Array.isArray(json?.projects)) {
          setProjects(json.projects);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = (projects ?? []).filter((p) => p.featured).slice(0, 3);
  const ready = projects !== null && featured.length > 0;

  return (
    <div className="mt-12 grid gap-6 md:grid-cols-3">
      {ready
        ? featured.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))
        : projects !== null && (
            <div className="md:col-span-3">
              <p className="rounded-xl border border-white/10 bg-ink-800/40 px-5 py-10 text-center text-muted">
                {t.realisations.empty}
              </p>
            </div>
          )}
      <Link
        href={`/${locale}/realisations`}
        className="btn-outline-accent btn-md mt-2 md:col-span-3 md:justify-self-center"
      >
        {t.common.viewAll}
      </Link>
    </div>
  );
}
