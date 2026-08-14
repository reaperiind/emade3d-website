"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { site } from "@/config/site";
import { services } from "@/data/services";
import { localized } from "@/lib/localize";
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

const SOCIALS = [
  { label: "Facebook", href: site.social.facebook, Icon: FacebookIcon },
  { label: "Instagram", href: site.social.instagram, Icon: InstagramIcon },
  { label: "LinkedIn", href: site.social.linkedin, Icon: LinkedinIcon },
  { label: "YouTube", href: site.social.youtube, Icon: YoutubeIcon },
  { label: "X", href: site.social.x, Icon: XIcon },
];

function FooterTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-widest2 text-steel-400">
      {children}
    </h3>
  );
}

export function Footer() {
  const { locale, t } = useI18n();
  const contact = site.contact;

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
              {SOCIALS.filter((s) => s.href).map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-white/12 text-steel-300 transition-all duration-200 hover:border-accent/50 hover:text-accent"
                >
                  <s.Icon className="h-4 w-4" />
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
