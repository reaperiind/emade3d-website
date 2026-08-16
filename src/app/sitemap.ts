import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { site } from "@/config/site";
import { projects } from "@/data/projects";

const staticPages = [
  { path: "" },
  { path: "/services" },
  { path: "/realisations" },
  { path: "/nouvelle-commande" },
  { path: "/suivre-ma-commande" },
  { path: "/comment-ca-marche" },
  { path: "/a-propos" },
  { path: "/faq" },
  { path: "/contact" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${site.domain}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: page.path === "" ? 1 : 0.8,
      });
    }
    for (const project of projects) {
      entries.push({
        url: `${site.domain}/${locale}/realisations/${project.slug}`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.6,
      });
    }
  }

  return entries;
}