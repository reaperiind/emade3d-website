"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { DevisCta } from "@/components/ui/devis-cta";

export default function NotFound() {
  const { locale, t } = useI18n();

  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-ink-950 pb-20 pt-32">
      <div aria-hidden className="technical-grid absolute inset-0 mask-fade-b" />
      <div className="container-site relative text-center">
        <p className="font-display text-[7rem] font-bold leading-none text-white/10 sm:text-[10rem]">
          {t.notFound.code}
        </p>
        <h1 className="h-display -mt-8 text-3xl sm:text-4xl">{t.notFound.title}</h1>
        <p className="text-muted mx-auto mt-4 max-w-md">{t.notFound.subtitle}</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={`/${locale}`} className="btn-outline btn-lg">
            {t.notFound.back}
          </Link>
          <DevisCta size="lg" />
        </div>
      </div>
    </section>
  );
}