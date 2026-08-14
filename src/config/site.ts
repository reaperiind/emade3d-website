/**
 * Emade3D — Site configuration.
 *
 * Everything that is likely to change (links, contact details, socials,
 * SEO identifiers) lives here so the UI code never has to be touched.
 *
 * IMPORTANT: The order requests / tracking live on the existing Emade3D Portal.
 * The website never implements its own ordering system — it simply redirects
 * visitors to the Portal through the two URLs below.
 */

import type { Locale } from "@/i18n/config";

export const PORTAL_URL =
  process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://portal.emade3d.store";

/** Portal order page for a given locale, e.g. /fr/new. */
export function portalNewOrderUrl(locale: Locale): string {
  return `${PORTAL_URL}/${locale}/new`;
}

/** Portal tracking page for a given locale, e.g. /fr/track. */
export function portalTrackingUrl(locale: Locale): string {
  return `${PORTAL_URL}/${locale}/track`;
}

/**
 * Language configuration.
 * - defaultLocale: language used when no locale prefix is present.
 * - Supported languages are defined in src/i18n/config.ts.
 */
export const site = {
  name: "Emade3D",
  tagline: "De l'idée à la pièce fabriquée",
  domain: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.emade3d.com",
  defaultLocale: "fr",

  /** Brand mark / accent shown across the site (hex, without #). */
  brand: {
    primary: "#0B0E14",
    accent: "#FF5A1F",
  },

  contact: {
    phone: "+213 555 00 00 00",
    phoneHref: "tel:+213555000000",
    whatsapp: "+213 555 00 00 00",
    whatsappHref:
      "https://wa.me/213555000000",
    email: "contact@emade3d.com",
    address_fr: "Zone Industrielle, Alger, Algérie",
    address_en: "Industrial Zone, Algiers, Algeria",
    address_ar: "المنطقة الصناعية، الجزائر، الجزائر",
    mapEmbed:
      "https://maps.google.com/maps?q=Alger%2C+Alg%C3%A9rie&t=&z=12&ie=UTF8&iwloc=&output=embed",
    hours_fr: "Lun – Sam : 08h30 – 18h00",
    hours_en: "Mon – Sat: 8:30 AM – 6:00 PM",
    hours_ar: "الاثنين – السبت: 08:30 – 18:00",
  },

  social: {
    facebook: "https://facebook.com/emade3d",
    instagram: "https://instagram.com/emade3d",
    linkedin: "https://linkedin.com/company/emade3d",
    youtube: "",
    x: "",
  },

  seo: {
    title_fr: "Emade3D — Conception 3D, Impression 3D et Fabrication",
    title_en: "Emade3D — 3D Design, 3D Printing and Manufacturing",
    title_ar: "Emade3D — تصميم ثلاثي الأبعاد، طباعة وتصنيع",
    description_fr:
      "Emade3D accompagne votre projet de l'idée à la pièce fabriquée : conception 3D, impression 3D, prototypage, outillage, moules et fabrication de pièces sur mesure.",
    description_en:
      "Emade3D takes your project from idea to finished part: 3D design, 3D printing, prototyping, tooling, molds and custom part manufacturing.",
    description_ar:
      "يرافقكم Emade3D من الفكرة إلى القطعة المصنّعة: تصميم ثلاثي الأبعاد، طباعة وتصنيع، نمذجة أولية، أدوات وقوالب، وتصنيع قطع حسب الطلب.",
    keywords: [
      "Emade3D",
      "Impression 3D",
      "Conception 3D",
      "Fabrication plastique",
      "Prototypage",
      "Pièces sur mesure",
      "Moules injection plastique",
      "Outillage",
      "Conception mécanique",
      "Fabrication industrielle",
    ],
    ogImage: "/og-cover.svg",
  },
} as const;