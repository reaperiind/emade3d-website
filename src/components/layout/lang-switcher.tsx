"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  locales,
  localeNames,
  localeShortNames,
  localizePath,
  type Locale,
} from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { GlobeIcon, ChevronDownIcon, CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export function LangSwitcher({ inline = false }: { inline?: boolean }) {
  const { locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  function select(next: Locale) {
    if (next === locale) {
      setOpen(false);
      return;
    }
    router.push(localizePath(pathname, next));
    setOpen(false);
  }

  if (inline) {
    return (
      <div className="flex items-center gap-1.5">
        {locales.map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => select(loc)}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-sm font-semibold transition",
              loc === locale
                ? "bg-accent text-ink-950"
                : "text-steel-300 hover:bg-white/10 hover:text-white"
            )}
            aria-label={localeNames[loc]}
          >
            {localeNames[loc]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Language"
        className="flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-steel-100 transition hover:border-white/35 hover:text-white"
      >
        <GlobeIcon className="h-4 w-4 text-accent" />
        <span>{localeShortNames[locale]}</span>
        <ChevronDownIcon
          className={cn("h-3.5 w-3.5 text-steel-400 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-lg border border-white/10 bg-ink-800 shadow-card-lg">
          {locales.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => select(loc)}
              className={cn(
                "flex w-full items-center justify-between px-4 py-2.5 text-sm transition hover:bg-white/5",
                loc === locale ? "text-accent" : "text-steel-200 hover:text-white"
              )}
            >
              {localeNames[loc]}
              {loc === locale && <CheckIcon className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}