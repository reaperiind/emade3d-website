"use client";

import { Reveal } from "@/components/ui/reveal";

export function PageHero({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-ink-950">
      <div aria-hidden className="technical-grid absolute inset-0 mask-fade-b" />
      <div
        aria-hidden
        className="absolute -top-32 start-1/3 h-72 w-[30rem] rounded-full bg-accent/[0.06] blur-[120px]"
      />
      <div className="container-site relative pb-16 pt-32 sm:pt-40 lg:pb-20">
        <Reveal>
          <span className="kicker">{kicker}</span>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="h-display mt-5 max-w-3xl text-4xl text-balance sm:text-5xl lg:text-6xl">
            {title}
          </h1>
        </Reveal>
        {subtitle && (
          <Reveal delay={160}>
            <p className="text-muted mt-6 max-w-2xl text-lg leading-relaxed">
              {subtitle}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}