"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/provider";
import { projects, projectCategories, type CategoryId } from "@/data/projects";
import { localized } from "@/lib/localize";
import { ProjectCard } from "@/components/sections/realisations-grid";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/reveal";

type Filter = CategoryId | "all";

export function PortfolioBrowser() {
  const { locale, t } = useI18n();
  const [active, setActive] = useState<Filter>("all");

  const filtered =
    active === "all" ? projects : projects.filter((p) => p.category === active);

  const pills: { id: Filter; label: string }[] = [
    { id: "all", label: t.common.allCategories },
    ...projectCategories.map((c) => ({
      id: c.id as Filter,
      label: localized(c.label, locale),
    })),
  ];

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

      {filtered.length === 0 ? (
        <p className="text-muted mt-16 text-center">{t.realisations.empty}</p>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, i) => (
            <Reveal key={project.slug} delay={(i % 3) * 70}>
              <ProjectCard project={project} className="h-full" />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}