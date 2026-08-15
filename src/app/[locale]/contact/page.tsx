import type { Metadata } from "next";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/config/site";
import { getSettings } from "@/lib/settings-store";
import { PageHero } from "@/components/sections/page-hero";
import { ContactForm } from "@/components/sections/contact-form";
import { Reveal } from "@/components/ui/reveal";
import {
  PhoneIcon,
  WhatsAppIcon,
  MailIcon,
  MapPinIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Metadata {
  const dict = getDictionary(params.locale);
  return buildMetadata({
    locale: params.locale,
    dict,
    page: "contact",
    pathname: "/contact",
  });
}

export default async function ContactPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const { locale } = params;
  const dict = getDictionary(locale);
  const settings = await getSettings();
  const c = settings.contact;

  const address =
    locale === "ar" ? c.address_ar : locale === "en" ? c.address_en : c.address_fr;
  const hours =
    locale === "ar" ? c.hours_ar : locale === "en" ? c.hours_en : c.hours_fr;

  const items = [
    {
      label: dict.contact.info.phone,
      value: c.phone,
      href: c.phoneHref,
      Icon: PhoneIcon,
    },
    {
      label: dict.contact.info.whatsapp,
      value: c.whatsapp,
      href: c.whatsappHref,
      external: true,
      Icon: WhatsAppIcon,
    },
    {
      label: dict.contact.info.email,
      value: c.email,
      href: `mailto:${c.email}`,
      Icon: MailIcon,
    },
    { label: dict.contact.info.address, value: address, Icon: MapPinIcon },
    { label: dict.contact.info.hours, value: hours, Icon: ClockIcon },
  ];

  return (
    <>
      <PageHero
        kicker={dict.contact.kicker}
        title={dict.contact.title}
        subtitle={dict.contact.subtitle}
      />

      <section className="section-pad bg-ink-950">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          {/* info */}
          <div className="space-y-4">
            {items.map((item, i) => {
              const content = (
                <>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent-dim text-accent">
                    <item.Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-widest text-steel-500">
                      {item.label}
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-white">
                      {item.value}
                    </p>
                  </div>
                </>
              );
              return (
                <Reveal key={item.label} delay={i * 60}>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className="card flex items-center gap-4 p-5 transition-colors hover:border-accent/40"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="card flex items-center gap-4 p-5">{content}</div>
                  )}
                </Reveal>
              );
            })}

            <Reveal delay={300}>
              <div className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-6">
                <h3 className="font-display text-lg font-semibold text-white">
                  {dict.contact.info.quoteTitle}
                </h3>
                <p className="text-muted mt-1.5 text-sm">{dict.contact.info.quoteText}</p>
                <Link
                  href={`/${locale}/demander-un-devis`}
                  className="btn-primary btn-md mt-5 w-full justify-between"
                >
                  <span>{dict.contact.info.quoteButton}</span>
                  <ArrowRightIcon className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </div>
            </Reveal>
          </div>

          {/* form */}
          <Reveal delay={120}>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      {/* map */}
      <section className="pb-20">
        <div className="container-site">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <iframe
              title={`${site.name} — ${dict.contact.info.address}`}
              src={c.mapEmbed}
              width="100%"
              height="420"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </>
  );
}