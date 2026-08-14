import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { locales } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { site } from "@/config/site";

type MetaPage = keyof Dictionary["meta"];

export function buildMetadata(opts: {
  locale: Locale;
  dict: Dictionary;
  page: MetaPage;
  /** Localized path without the locale prefix. "/" for the home page. */
  pathname: string;
  title?: string;
  description?: string;
}): Metadata {
  const { locale, dict, page, pathname, title, description } = opts;
  const meta = dict.meta[page];
  const cleanPath = pathname === "/" ? "" : pathname;
  const canonical = `${site.domain}/${locale}${cleanPath}`;

  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = `${site.domain}/${l}${cleanPath}`;
  }

  const ogLocale =
    locale === "fr" ? "fr_FR" : locale === "en" ? "en_US" : "ar_DZ";

  return {
    title: title ?? meta.title,
    description: description ?? meta.description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: title ?? meta.title,
      description: description ?? meta.description,
      url: canonical,
      siteName: site.name,
      locale: ogLocale,
      type: "website",
      images: [
        {
          url: `${site.domain}${site.seo.ogImage}`,
          width: 1200,
          height: 630,
          alt: site.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? meta.title,
      description: description ?? meta.description,
    },
  };
}

/** Structured data describing the company (JSON-LD / Organization). */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.domain,
    slogan: site.tagline,
    description: site.seo.description_fr,
    logo: `${site.domain}/logo.svg`,
    sameAs: Object.values(site.social).filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: site.contact.phone,
      email: site.contact.email,
      contactType: "sales",
      availableLanguage: ["French", "English", "Arabic"],
    },
  };
}