"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  locales,
  localeNames,
  localizePath,
  type Locale,
} from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { LogoMark } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * Language welcome modal shown only once per first visit.
 *
 * The visitor picks a language and is sent to the same page in that locale.
 * Their choice is remembered in localStorage, so on later visits the site
 * opens directly — the language can be changed via the language icon in the
 * header (LangSwitcher) without reopening this modal.
 */
const WELCOME_KEY = "emade3d-language-welcomed";

export function LanguageModal() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(WELCOME_KEY)) {
        return;
      }
      setOpen(true);
      localStorage.setItem(WELCOME_KEY, "1");
    } catch {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function select(next: Locale) {
    if (next === locale) {
      setOpen(false);
      return;
    }
    setLeaving(true);
    window.setTimeout(() => {
      router.push(localizePath(pathname, next));
    }, 240);
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] flex items-center justify-center p-4 transition-all duration-200",
        open && !leaving
          ? "opacity-100"
          : "pointer-events-none opacity-0"
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-ink-950/85 backdrop-blur-md"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.nav.welcomeTitle}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-ink-900 p-8 text-center shadow-2xl shadow-black/60"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-accent/30 bg-accent-dim text-accent">
          <LogoMark className="h-8 w-8" />
        </span>
        <h2 className="h-display mt-5 text-2xl font-semibold text-white sm:text-3xl">
          {t.nav.welcomeTitle}
        </h2>
        <p className="text-muted mt-2 text-sm leading-relaxed">
          {t.nav.welcomeText}
        </p>

        <div className="mt-7 grid gap-2.5">
          {locales.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => select(loc)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition",
                loc === locale
                  ? "border-accent/50 bg-accent-dim text-white"
                  : "border-white/12 bg-ink-800 text-steel-200 hover:border-accent/40 hover:text-white"
              )}
            >
              <span className="font-display text-base">
                {localeNames[loc]}
              </span>
              <span className="rounded-md border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-steel-400">
                {loc.toUpperCase()}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-6 text-xs text-steel-500 underline-offset-4 transition hover:text-steel-300 hover:underline"
        >
          {t.common.close}
        </button>
      </div>
    </div>
  );
}