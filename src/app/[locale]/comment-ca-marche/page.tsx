import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/sections/page-hero";
import { ProcessTimeline } from "@/components/sections/process-steps";
import { CtaSection } from "@/components/sections/cta-section";
import { Reveal } from "@/components/ui/reveal";

export function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Metadata {
  const dict = getDictionary(params.locale);
  return buildMetadata({
    locale: params.locale,
    dict,
    page: "process",
    pathname: "/comment-ca-marche",
  });
}

export default function ProcessPage({ params }: { params: { locale: Locale } }) {
  const dict = getDictionary(params.locale);

  return (
    <>
      <PageHero
        kicker={dict.process.kicker}
        title={dict.process.title}
        subtitle={dict.process.subtitle}
      />

      <section className="section-pad bg-ink-950">
        <div className="container-site">
          <Reveal>
            <p className="text-muted mx-auto max-w-2xl text-center text-lg leading-relaxed">
              {dict.process.intro}
            </p>
          </Reveal>
          <div className="mt-16">
            <ProcessTimeline />
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}