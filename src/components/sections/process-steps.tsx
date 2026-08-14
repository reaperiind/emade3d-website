"use client";

import { processSteps } from "@/data/process";
import { localized } from "@/lib/localize";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/reveal";
import {
  BoxIcon,
  SearchIcon,
  PenToolIcon,
  CheckIcon,
  CogIcon,
  WrenchIcon,
} from "@/components/ui/icons";

const STEP_ICONS = [BoxIcon, SearchIcon, PenToolIcon, CheckIcon, CogIcon, WrenchIcon];

/** Grid layout â€” used on the home page. */
export function ProcessGrid() {
  const { locale } = useI18n();
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {processSteps.map((step, i) => {
        const Icon = STEP_ICONS[i] ?? BoxIcon;
        return (
          <Reveal key={step.id} delay={i * 70}>
            <div className="card group relative h-full overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40">
              <span className="absolute end-4 top-4 font-display text-5xl font-bold text-white/[0.06] transition-colors group-hover:text-accent/10">
                {step.number}
              </span>
              <Icon className="h-7 w-7 text-accent" />
              <h3 className="mt-5 font-display text-xl font-semibold text-white">
                <span className="me-2 text-accent">{step.number}</span>
                {localized(step.title, locale)}
              </h3>
              <p className="text-muted mt-2.5 text-sm leading-relaxed">
                {localized(step.description, locale)}
              </p>
              <span className="mt-4 inline-block rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-steel-400">
                {localized(step.hint, locale)}
              </span>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

/** Alternating timeline layout â€” used on the "Comment Ã§a marche" page. */
export function ProcessTimeline() {
  const { locale } = useI18n();
  return (
    <div className="relative mx-auto max-w-4xl">
      <span className="absolute inset-y-0 start-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-accent/60 via-white/15 to-transparent lg:block rtl:translate-x-1/2" />

      <div className="space-y-10 lg:space-y-0">
        {processSteps.map((step, i) => {
          const Icon = STEP_ICONS[i] ?? BoxIcon;
          const even = i % 2 === 0;
          return (
            <Reveal key={step.id} delay={60}>
              <div
                className={cn(
                  "relative lg:grid lg:grid-cols-2 lg:gap-16",
                  !even && "lg:justify-items-end"
                )}
              >
                {/* node */}
                <span
                  className={cn(
                    "absolute top-1 start-1/2 z-10 hidden h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-accent/50 bg-ink-950 text-accent lg:flex rtl:translate-x-1/2"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>

                <div
                  className={cn(
                    "lg:col-span-1",
                    even ? "lg:pe-14" : "lg:col-start-2 lg:ps-14"
                  )}
                >
                  <div className="card group relative h-full overflow-hidden border-white/10 p-6 transition-colors hover:border-accent/40 sm:p-7">
                    <div
                      className={cn(
                        "mb-4 flex items-center gap-4",
                        even ? null : "lg:flex-row-reverse"
                      )}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent-dim text-accent lg:hidden">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-start font-display text-sm font-bold tracking-widest text-accent">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl font-semibold text-white">
                      {localized(step.title, locale)}
                    </h3>
                    <p className="text-muted mt-3 leading-relaxed">
                      {localized(step.description, locale)}
                    </p>
                    <span className="mt-4 inline-block rounded-full border border-white/10 px-3 py-1 text-xs text-steel-400">
                      {localized(step.hint, locale)}
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
