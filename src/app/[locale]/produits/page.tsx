import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/sections/page-hero";
import { ProductsBrowser } from "@/components/sections/products-browser";
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
    page: "products",
    pathname: "/produits",
  });
}

export default async function ProductsPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const dict = getDictionary(params.locale);

  return (
    <>
      <PageHero
        kicker={dict.products.kicker}
        title={dict.products.title}
        subtitle={dict.products.subtitle}
      />
      <section className="section-pad bg-ink-950">
        <div className="container-site">
          <ProductsBrowser />
        </div>
      </section>
      <CtaSection />
    </>
  );
}