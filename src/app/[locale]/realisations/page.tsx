import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/sections/page-hero";
import { PortfolioBrowser } from "@/components/sections/portfolio-browser";
import { CtaSection } from "@/components/sections/cta-section";

export function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Metadata {
  const dict = getDictionary(params.locale);
  return buildMetadata({
    locale: params.locale,
    dict,
    page: "realisations",
    pathname: "/realisations",
  });
}

export default async function RealisationsPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const dict = getDictionary(params.locale);

  return (
    <>
      <PageHero
        kicker={dict.realisations.kicker}
        title={dict.realisations.title}
        subtitle={dict.realisations.subtitle}
      />
      <section className="section-pad bg-ink-950">
        <div className="container-site">
          <PortfolioBrowser />
        </div>
      </section>
      <CtaSection />
    </>
  );
}