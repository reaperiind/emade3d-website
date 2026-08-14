"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/reveal";
import { HeroVisual } from "@/components/visual/hero-visual";
import { DevisCta } from "@/components/ui/devis-cta";
import { ChevronDownIcon } from "@/components/ui/icons";

export function HeroSection() {
  const { locale, t } = useI18n();

  const title = t.hero.title;
  const word = t.hero.accentWord;
  const idx = title.lastIndexOf(word);
  const before = idx > 0 ? title.slice(0, idx) : "";
  const rest = idx > 0 ? title.slice(idx + word.length) : title;

  return (
    <section className="relative overflow-hidden bg-ink-950">
      {/* backdrop */}
      <div aria-hidden className="technical-grid absolute inset-0 mask-fade-b" />
      <div
        aria-hidden
        className="absolute -top-40 start-1/4 h-96 w-[36rem] rounded-full bg-accent/[0.07] blur-[140px]"
      />

      <div className="container-site relative grid items-center gap-12 pb-16 pt-28 sm:pt-32 lg:grid-cols-2 lg:gap-10 lg:pb-24 lg:pt-40">
        {/* Copy */}
        <div>
          <Reveal>
            <p className="kicker">{t.hero.kicker}</p>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="h-display mt-6 text-4xl text-balance sm:text-5xl lg:text-6xl xl:text-[4.15rem]">
              {before}
              {idx > 0 && <span className="text-accent">{word}</span>}
              {rest}
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="text-muted mt-6 max-w-xl text-lg leading-relaxed">
              {t.hero.subtitle}
            </p>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <DevisCta size="lg" className="w-full sm:w-auto" />
              <Link
                href={`/${locale}/realisations`}
                className="btn-outline btn-lg w-full sm:w-auto"
              >
                {t.hero.ctaRealisations}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={360}>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {t.hero.badges.map((badge) => (
                <div key={badge.label}>
                  <dt className="sr-only">{badge.label}</dt>
                  <dd className="font-display text-xl font-bold text-white sm:text-2xl">
                    {badge.value}
                  </dd>
                  <dd className="mt-1 text-xs text-steel-500">{badge.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* Visual */}
        <Reveal delay={200} className="relative">
          <div className="relative mx-auto w-full max-w-xl">
            <div
              aria-hidden
              className="absolute -inset-6 rounded-3xl bg-accent/5 blur-2xl"
            />
            <div className="relative animate-float">
              <HeroVisual className="aspect-[4/3] w-full" />
            </div>

            {/* floating spec chips */}
            <div className="absolute -start-3 top-8 hidden rounded-lg border border-white/10 bg-ink-950/90 px-3.5 py-2.5 backdrop-blur md:block">
              <p className="text-[10px] uppercase tracking-widest text-steel-500">
                CAO
              </p>
              <p className="font-display text-sm font-bold text-white">
                STEP · IGES
              </p>
            </div>
            <div className="absolute -end-3 bottom-10 hidden rounded-lg border border-accent/30 bg-ink-950/90 px-3.5 py-2.5 backdrop-blur md:block">
              <p className="text-[10px] uppercase tracking-widest text-steel-500">
                Tolerance
              </p>
              <p className="font-display text-sm font-bold text-accent">
                ± 0,1 mm
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 lg:block rtl:translate-x-1/2">
        <ChevronDownIcon className="h-5 w-5 animate-bounce text-steel-500" />
      </div>
    </section>
  );
}