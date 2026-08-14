"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/provider";
import { ArrowRightIcon } from "@/components/ui/icons";

/**
 * The "Demander un devis" CTA opens the in-site quote page, which in turn
 * sends the customer to the Emade3D Portal (see /src/config/site.ts →
 * PORTAL_URL). This keeps the funnel consistent and the portal URL centralized.
 */
export function DevisCta({
  size = "md",
  className,
  withIcon = true,
}: {
  size?: "lg" | "md";
  className?: string;
  withIcon?: boolean;
}) {
  const { locale, t } = useI18n();
  const sizeClass = size === "lg" ? "btn-lg" : "btn-md";
  return (
    <Link
      href={`/${locale}/demander-un-devis`}
      aria-label={t.nav.devis}
      className={cn("btn-primary", sizeClass, className)}
    >
      {t.nav.devis}
      {withIcon && (
        <ArrowRightIcon className="h-4 w-4 rtl:rotate-180" />
      )}
    </Link>
  );
}