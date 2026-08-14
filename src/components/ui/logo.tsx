"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/ui/icons";

export function Logo({
  href,
  className,
  showBaseline,
}: {
  href?: string;
  className?: string;
  showBaseline?: boolean;
}) {
  const { locale } = useI18n();
  const target = href ?? `/${locale}`;

  return (
    <Link
      href={target}
      aria-label="Emade3D â€” Accueil"
      className={cn("group inline-flex flex-col leading-none", className)}
    >
      <span className="flex items-center gap-2.5">
        <span className="text-accent transition-transform duration-300 group-hover:-translate-y-0.5">
          <LogoMark className="h-8 w-8" />
        </span>
        <span className="font-display text-xl font-bold tracking-tight text-white">
          Emade
          <span className="text-accent">3</span>
          D
        </span>
      </span>
      {showBaseline && (
        <span className="mt-1.5 text-[10px] font-medium uppercase tracking-widest2 text-steel-400">
          {locale === "ar" ? "Ù‡Ù†Ø¯Ø³Ø© Â· ØªØµÙ…ÙŠÙ… Â· ØªØµÙ†ÙŠØ¹" : "Engineering Â· Design Â· Manufacturing"}
        </span>
      )}
    </Link>
  );
}
