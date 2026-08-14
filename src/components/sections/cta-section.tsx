"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { DevisCta } from "@/components/ui/devis-cta";
import { Reveal } from "@/components/ui/reveal";

export function CtaSection() {
  const { locale, t } = useI18n();

  return (
    <section className="section-pad relative overflow-hidden bg-ink-900">
      <div
        aria-hidden
        className="technical-grid absolute inset-0 opacity-60"
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-0 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
      />
      <div className="container-site relative text-center">
        <Reveal>
          <span className="kicker justify-center before:hidden">{t.cta.kicker}</span>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="h-display mx-auto mt-4 max-w-2xl text-3xl text-balance sm:text-5xl">
            {t.cta.title}
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p className="text-muted mx-auto mt-5 max-w-xl text-lg leading-relaxed">
            {t.cta.lead}
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <DevisCta size="lg" className="w-full sm:w-auto" />
            <Link
              href={`/${locale}/suivre-ma-commande`}
              className="btn-outline btn-lg w-full sm:w-auto"
            >
              {t.cta.tracking}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
