import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo";
import { localized } from "@/lib/localize";
import { faqItems } from "@/data/faq";
import { site } from "@/config/site";
import { PageHero } from "@/components/sections/page-hero";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { CtaSection } from "@/components/sections/cta-section";
import { Reveal } from "@/components/ui/reveal";
import { WhatsAppIcon, MailIcon } from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/buttons";

export function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Metadata {
  const dict = getDictionary(params.locale);
  return buildMetadata({
    locale: params.locale,
    dict,
    page: "faq",
    pathname: "/faq",
  });
}

export default function FaqPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = getDictionary(locale);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: localized(item.question, locale),
      acceptedAnswer: {
        "@type": "Answer",
        text: localized(item.answer, locale),
      },
    })),
  };

  return (
    <>
      <PageHero
        kicker={dict.faq.kicker}
        title={dict.faq.title}
        subtitle={dict.faq.subtitle}
      />

      <section className="section-pad bg-ink-950">
        <div className="container-site max-w-4xl">
          <FaqAccordion />

          {/* still have a question */}
          <Reveal>
            <div className="mt-12 rounded-xl border border-accent/25 bg-accent-dim/50 p-7 text-center sm:p-9">
              <h2 className="font-display text-2xl font-semibold text-white">
                {dict.faq.moreTitle}
              </h2>
              <p className="text-muted mt-2">{dict.faq.moreText}</p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <ButtonLink
                  href={`/${locale}/contact`}
                  className="btn-primary btn-md w-full sm:w-auto"
                >
                  <MailIcon className="h-4 w-4" />
                  {dict.faq.cta}
                </ButtonLink>
                <ButtonLink
                  href={site.contact.whatsappHref}
                  external
                  className="btn-outline btn-md w-full sm:w-auto"
                >
                  <WhatsAppIcon className="h-4 w-4 text-accent" />
                  {dict.faq.askWhatsapp}
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaSection />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}