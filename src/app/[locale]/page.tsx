import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesGrid } from "@/components/sections/services-grid";
import { SolutionSection } from "@/components/sections/solution-section";
import { RealisationsHomeSection } from "@/components/sections/realisations-home";
import { ProcessHomeSection } from "@/components/sections/process-home";
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
    page: "home",
    pathname: "/",
  });
}

export default function HomePage({ params }: { params: { locale: Locale } }) {
  void params;
  return (
    <>
      <HeroSection />
      <ServicesGrid compact />
      <SolutionSection />
      <RealisationsHomeSection />
      <ProcessHomeSection />
      <CtaSection />
    </>
  );
}