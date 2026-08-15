"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { site } from "@/config/site";
import { services } from "@/data/services";
import { localized } from "@/lib/localize";
import type { ContactInfo, SocialLinks } from "@/lib/settings-store";
import { Logo } from "@/components/ui/logo";
import {
  PhoneIcon,
  WhatsAppIcon,
  MailIcon,
  MapPinIcon,
  ClockIcon,
  ArrowUpRightIcon,
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  LinkedinIcon,
  YoutubeIcon,
  XIcon,
} from "@/components/ui/icons";

const NAV = [
  { key: "home", href: "/" },
  { key: "services", href: "/services" },
  { key: "realisations", href: "/realisations" },
  { key: "process", href: "/comment-ca-marche" },
  { key: "about", href: "/a-propos" },
  { key: "faq", href: "/faq" },
  { key: "contact", href: "/contact" },
] as const;

function SocialIcon({ label }: { label: keyof SocialLinks }) {
  switch (label) {
    case "facebook":
      return <FacebookIcon className="h-4 w-4" />;
    case "instagram":
      return <InstagramIcon className="h-4 w-4" />;
    case "tiktok":
      return <TikTokIcon className="h-4 w-4" />;
    case "linkedin":
      return <LinkedinIcon className="h-4 w-4" />;
    case "youtube":
      return <YoutubeIcon className="h-4 w-4" />;
    default:
      return <XIcon className="h-4 w-4" />;
  }
}

const SOCIAL_KEYS: (keyof SocialLinks)[] = [
  "facebook",
  "instagram",
  "tiktok",
  "linkedin",
  "youtube",
  "x",
];

const DEFAULT_CONTACT: ContactInfo = {
  phone: site.contact.phone,
  phoneHref: site.contact.phoneHref,
  whatsapp: site.contact.whatsapp,
  whatsappHref: site.contact.whatsappHref,
  email: site.contact.email,
  address_fr: site.contact.address_fr,
  address_en: site.contact.address_en,
  address_ar: site.contact.address_ar,
  mapEmbed: site.contact.mapEmbed,
  hours_fr: site.contact.hours_fr,
  hours_en: site.contact.hours_en,
  hours_ar: site.contact.hours_ar,
};

function FooterTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-widest2 text-steel-400">
      {children}
    </h3>
  );
}

export function Footer() {
  const { locale, t } = useI18n();
  const [contact, setContact] = useState<ContactInfo>(DEFAULT_CONTACT);
  const [social, setSocial] = useState<Partial<SocialLinks>>({ ...site.social });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled || !json?.settings) return;
        const s = json.settings;
        if (s.contact) setContact({ ...DEFAULT_CONTACT, ...s.contact });
        if (s.social) setSocial({ ...site.social, ...s.social });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const address =
    locale === "ar"
      ? contact.address_ar
      : locale === "en"
        ? contact.address_en
        : contact.address_fr;

  const hours =
    locale === "ar"
      ? contact.hours_ar
      : locale === "en"
        ? contact.hours_en
        : contact.hours_fr;

  return (
    <footer className="border-t border-white/10 bg-ink-900">
      <div className="container-site py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr] lg:gap-10">
          {/* Brand */}
          <div>
            <Logo showBaseline />
            <p className="text-muted mt-5 max-w-sm text-sm leading-relaxed">
              {t.footer.description}
            </p>
<div className="mt-6 flex items-center gap-2.5">
              {SOCIAL_KEYS.filter((k) => social[k]).map((k) => (
                <a
                  key={k}
                  href={social[k]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={k}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-white/12 text-steel-300 transition-all duration-200 hover:border-accent/50 hover:text-accent"
                >
                  <SocialIcon label={k} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <nav aria-label={t.footer.nav}>
            <FooterTitle>{t.footer.nav}</FooterTitle>
            <ul className="mt-5 space-y-3">
              {NAV.map((item) => (
                <li key={item.key}>
                  <Link
                    href={`/${locale}${item.href}`}
                    className="text-sm text-steel-300 transition-colors hover:text-accent"
                  >
                    {t.nav[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services */}
          <div>
            <FooterTitle>{t.footer.services}</FooterTitle>
            <ul className="mt-5 space-y-3">
              {services.map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/${locale}/services#${service.id}`}
                    className="text-sm text-steel-300 transition-colors hover:text-accent"
                  >
                    {localized(service.title, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <FooterTitle>{t.footer.contact}</FooterTitle>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a
                  href={contact.phoneHref}
                  className="group flex items-center gap-3 text-steel-300 transition-colors hover:text-accent"
                >
                  <PhoneIcon className="h-4 w-4 shrink-0 text-accent" />
                  {contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-steel-300 transition-colors hover:text-accent"
                >
                  <WhatsAppIcon className="h-4 w-4 shrink-0 text-accent" />
                  {t.contact.info.whatsapp} â€” {contact.whatsapp}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 text-steel-300 transition-colors hover:text-accent"
                >
                  <MailIcon className="h-4 w-4 shrink-0 text-accent" />
                  {contact.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-steel-300">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {address}
              </li>
              <li className="flex items-start gap-3 text-steel-300">
                <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {hours}
              </li>
            </ul>

<div className="mt-6 space-y-2.5">
              <Link
                href={`/${locale}/demander-un-devis`}
                className="btn-primary btn-md w-full justify-between"
              >
                <span>{t.nav.newOrder}</span>
                <ArrowUpRightIcon className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <Link
                href={`/${locale}/suivre-ma-commande`}
                className="btn-outline btn-md w-full justify-between"
              >
                <span>{t.nav.tracking}</span>
                <ArrowUpRightIcon className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-6 text-center sm:flex-row sm:text-start">
          <p className="text-xs text-steel-400">
            Â© {new Date().getFullYear()} {site.name}. {t.footer.rights}
          </p>
          <p className="text-xs text-steel-500">{t.footer.madeWith}</p>
        </div>
      </div>
    </footer>
  );
}
