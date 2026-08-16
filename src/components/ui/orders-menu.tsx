"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import { ChevronDownIcon, PlusIcon, SearchIcon } from "@/components/ui/icons";

/**
 * Header "Mes commandes" button with a dropdown revealed on hover.
 *
 * Two actions are offered:
 *  - "Nouvelle commande"  → the in-site order page (/nouvelle-commande)
 *  - "Suivre ma commande" → the in-site tracking page (/suivre-ma-commande)
 */
export function OrdersMenu({
  size = "md",
  className,
}: {
  size?: "lg" | "md";
  className?: string;
}) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const sizeClass = size === "lg" ? "btn-lg" : "btn-md";

  const items = [
    {
      key: "newOrder",
      label: t.nav.newOrder,
      sub: t.quote.kicker,
      href: `/${locale}/nouvelle-commande`,
      Icon: PlusIcon,
    },
    {
      key: "track",
      label: t.nav.tracking,
      sub: t.track.kicker,
      href: `/${locale}/suivre-ma-commande`,
      Icon: SearchIcon,
    },
  ];

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn("btn-primary", sizeClass, className)}
      >
        {t.nav.orders}
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <div
        role="menu"
        className={cn(
          "absolute end-0 top-full z-50 mt-2 w-64 origin-top-end rounded-xl border border-white/10 bg-ink-900 p-1.5 shadow-2xl shadow-black/50 transition-all duration-150",
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1.5 opacity-0"
        )}
      >
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            role="menuitem"
            className="group flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-white/5"
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-accent-dim text-accent">
              <item.Icon className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-white transition-colors group-hover:text-accent">
                {item.label}
              </span>
              <span className="mt-0.5 block text-xs text-steel-400">
                {item.sub}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}