"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { projectCategories, type CategoryId, type Project } from "@/data/projects";
import { localized } from "@/lib/localize";
import { ProjectCard } from "@/components/sections/realisations-grid";
import { Lightbox } from "@/components/ui/lightbox";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/reveal";

type Filter = CategoryId | "all";

const MEDIA_URL = (key: string) => `/api/media/${key}`;

export function PortfolioBrowser() {
  const { locale, t } = useI18n();
  const [active, setActive] = useState<Filter>("all");
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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

  const filtered =
    active === "all" ? (projects ?? []) : (projects ?? []).filter((p) => p.category === active);

  const pills: { id: Filter; label: string }[] = [
    { id: "all", label: t.common.allCategories },
    ...projectCategories.map((c) => ({
      id: c.id as Filter,
      label: localized(c.label, locale),
    })),
  ];

  // All cover images of the currently displayed projects, in display order.
  const galleryImages = filtered
    .map((p) => p.images?.[0])
    .filter((key): key is string => Boolean(key))
    .map((key) => MEDIA_URL(key));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {pills.map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => setActive(pill.id)}
            aria-pressed={active === pill.id}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
              active === pill.id
                ? "border-accent bg-accent text-ink-950"
                : "border-white/15 text-steel-300 hover:border-white/35 hover:text-white"
            )}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {projects === null ? (
        <p className="text-muted mt-16 text-center">{t.realisations.loading ?? "…"}</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted mt-16 text-center">{t.realisations.empty}</p>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, i) => {
            const cover = project.images?.[0];
            const indexInGallery = cover ? galleryImages.indexOf(MEDIA_URL(cover)) : -1;
            return (
              <Reveal key={project.slug} delay={(i % 3) * 70}>
                <ProjectCard
                  project={project}
                  className="h-full"
                  onImageClick={
                    cover && indexInGallery !== -1
                      ? () => setLightboxIndex(indexInGallery)
                      : undefined
                  }
                />
              </Reveal>
            );
          })}
        </div>
      )}

      {lightboxIndex !== null && galleryImages.length > 0 && (
        <Lightbox
          images={galleryImages}
          index={lightboxIndex}
          onIndex={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
          label={t.common.viewProject}
        />
      )}
    </div>
  );
}