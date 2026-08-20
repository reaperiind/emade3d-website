"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/logo";
import { OrdersMenu } from "@/components/ui/orders-menu";
import { LangSwitcher } from "@/components/layout/lang-switcher";
import { MenuIcon, CloseIcon, ArrowUpRightIcon } from "@/components/ui/icons";

const NAV_ITEMS = [
  { key: "home", href: "/" },
  { key: "services", href: "/services" },
  { key: "realisations", href: "/realisations" },
  { key: "products", href: "/produits" },
  { key: "process", href: "/comment-ca-marche" },
  { key: "about", href: "/a-propos" },
  { key: "contact", href: "/contact" },
] as const;

export function Header() {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) => {
    const path = pathname.replace(/^\/[a-z]{2}(\/|$)/, "/");
    if (href === "/") return path === "/" || path === "";
    return path.startsWith(href);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || menuOpen
          ? "border-b border-white/10 bg-ink-950/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav
        aria-label={t.nav.menu}
        className="container-site flex h-16 items-center justify-between gap-4 lg:h-20"
      >
        <Logo />

        {/* Desktop navigation */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <Link
                href={`/${locale}${item.href}`}
                className={cn(
                  "relative rounded-md px-3.5 py-2 text-sm font-medium transition",
                  isActive(item.href)
                    ? "text-white"
                    : "text-steel-300 hover:text-white"
                )}
              >
                {t.nav[item.key]}
                {isActive(item.href) && (
                  <span className="absolute inset-x-3.5 -bottom-px h-0.5 rounded-full bg-accent" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <LangSwitcher />
          <OrdersMenu
            size="md"
            className="hidden !px-4 lg:inline-flex"
          />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={t.nav.menu}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white transition hover:border-white/30 lg:hidden"
          >
            {menuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute inset-x-0 top-full z-40 h-[calc(100dvh-4rem)] overflow-y-auto bg-ink-950 backdrop-blur-xl transition-all duration-300 lg:hidden",
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      >
        <div className="container-site flex flex-1 flex-col py-8">
          <ul className="flex flex-col divide-y divide-white/10">
            {NAV_ITEMS.map((item, i) => (
              <li key={item.key}>
                <Link
                  href={`/${locale}${item.href}`}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between py-4 font-display text-2xl font-semibold transition",
                    isActive(item.href) ? "text-accent" : "text-white hover:text-accent"
                  )}
                >
                  <span className="flex items-baseline gap-4">
                    <span className="text-xs font-sans font-medium text-steel-500">
                      0{i + 1}
                    </span>
                    {t.nav[item.key]}
                  </span>
                  <ArrowUpRightIcon className="h-5 w-5 text-steel-500" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 space-y-5">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-ink-800/60 px-4 py-4">
              <span className="text-sm font-semibold text-steel-300">
                {t.nav.language}
              </span>
              <LangSwitcher inline />
            </div>
            <div className="mt-8 grid gap-2.5">
              <Link
                href={`/${locale}/nouvelle-commande`}
                onClick={() => setMenuOpen(false)}
                className="btn-primary btn-md w-full justify-between"
              >
                <span>{t.nav.newOrder}</span>
                <ArrowUpRightIcon className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <Link
                href={`/${locale}/suivre-ma-commande`}
                onClick={() => setMenuOpen(false)}
                className="btn-outline btn-md w-full justify-between"
              >
                <span>{t.nav.tracking}</span>
                <ArrowUpRightIcon className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}