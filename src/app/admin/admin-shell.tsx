"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark, LogOutIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const TOKEN_KEY = "emade3d-admin-token";

const AdminTokenContext = createContext<string>("");

export function useAdminToken(): string {
  return useContext(AdminTokenContext);
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M4 11l8-7 8 7v8.5a1.5 1.5 0 01-1.5 1.5H14v-6h-4v6H5.5A1.5 1.5 0 014 19.5V11z" strokeLinejoin="round" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" strokeLinejoin="round" />
      <path d="M3.3 8.3L12 13l8.7-4.7M12 13v9" strokeLinejoin="round" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M6 7h12l1.5 12.5a1.5 1.5 0 01-1.5 1.5H6a1.5 1.5 0 01-1.5-1.5L6 7z" strokeLinejoin="round" />
      <path d="M9 10V6a3 3 0 016 0v4" strokeLinecap="round" />
    </svg>
  );
}

function DeliveryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M2 7h11v10H2zM13 10h4l4 3.5V17h-8" strokeLinejoin="round" />
      <circle cx="6.5" cy="17.5" r="1.8" />
      <circle cx="16.5" cy="17.5" r="1.8" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.5v.5" strokeLinecap="round" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M3 17l5.2-4.6a1.5 1.5 0 012 0L15 17m-2.8-2.5l2-1.8a1.5 1.5 0 012 0L21 16.5" strokeLinejoin="round" />
    </svg>
  );
}

export const ADMIN_NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Tableau de bord", hint: "Vue d'ensemble", icon: <HomeIcon /> },
  { href: "/admin/orders", label: "Commandes", hint: "Suivi des projets", icon: <OrdersIcon /> },
  { href: "/admin/products", label: "Produits", hint: "Boutique & demandes", icon: <ProductsIcon /> },
  { href: "/admin/delivery", label: "Livraison", hint: "Wilayas, communes, frais", icon: <DeliveryIcon /> },
  { href: "/admin/info", label: "Informations", hint: "Contact, réseaux sociaux", icon: <InfoIcon /> },
  { href: "/admin/gallery", label: "Galerie", hint: "Réalisations", icon: <GalleryIcon /> },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/admin/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved = window.localStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
    setReady(true);
  }, []);

  async function onLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = new FormData(e.currentTarget).get("password") as string;
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const data = await res.json();
      window.localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dzb-cream">
        <span className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-dzb-amber to-dzb-amberdeep text-white">
          <LogoMark className="h-8 w-8" />
        </span>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-dzb-cream px-4">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-dzb-sand/60 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 right-[-6rem] h-80 w-80 rounded-full bg-dzb-tint blur-3xl"
        />

        <div className="relative w-full max-w-sm">
          <div className="mb-7 flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-dzb-amber to-dzb-amberdeep text-white shadow-[0_18px_36px_-14px_rgba(247,169,33,0.9)]">
              <LogoMark className="h-9 w-9" />
            </span>
            <h1 className="mt-5 font-display text-2xl font-bold text-dzb-navy">
              Emade3D <span className="text-dzb-amberink">Admin</span>
            </h1>
            <p className="mt-1 text-sm font-medium text-dzb-muted">
              Espace réservé — connectez-vous pour gérer votre activité
            </p>
          </div>

          <form
            onSubmit={onLogin}
            className="rounded-[24px] border border-dzb-creamline bg-white p-7 shadow-[0_20px_50px_-20px_rgba(27,26,45,0.25)] sm:p-8"
          >
            <label
              htmlFor="admin-password"
              className="mb-1.5 block text-xs font-semibold text-dzb-muted"
            >
              Mot de passe
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              required
              autoFocus
              onChange={() => setLoginError(false)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#e6d9bf] bg-white px-4 py-3 text-sm text-dzb-navy placeholder:text-[#b3ab9c] transition focus:border-dzb-amber focus:outline-none focus:ring-4 focus:ring-dzb-amber/15"
            />
            {loginError && (
              <p className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">
                Mot de passe incorrect.
              </p>
            )}
            <button
              type="submit"
              className="mt-5 w-full rounded-full bg-dzb-amber py-3 text-sm font-bold text-dzb-inkdark shadow-[0_10px_24px_-10px_rgba(247,169,33,0.9)] transition hover:bg-dzb-amberdeep"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  const activeItem =
    ADMIN_NAV_ITEMS.find((item) => isActivePath(pathname, item.href)) ??
    ADMIN_NAV_ITEMS[0];

  return (
    <AdminTokenContext.Provider value={token}>
      <div className="min-h-screen bg-dzb-cream text-dzb-navy">
        <header className="sticky top-0 z-30 border-b border-dzb-creamline bg-white/85 backdrop-blur-md">
          <div className="container-site flex h-16 items-center justify-between px-4 sm:px-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-dzb-amber to-dzb-amberdeep text-white shadow-[0_8px_18px_-8px_rgba(247,169,33,0.9)]">
                <LogoMark className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <p className="font-display text-base font-bold text-dzb-navy">
                  Emade3D <span className="text-dzb-amberink">Admin</span>
                </p>
                <p className="text-[11px] font-medium text-dzb-faint">
                  Tableau de bord
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-dzb-navy/10 bg-white px-4 py-2 text-sm font-semibold text-dzb-muted transition hover:border-red-300 hover:text-red-600"
            >
              <LogOutIcon className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </header>

        <div className="container-site flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
          <aside className="hidden w-64 shrink-0 md:block">
            <nav className="sticky top-24 space-y-1.5 rounded-[20px] border border-dzb-creamline bg-white p-3 shadow-[0_6px_20px_rgba(27,26,45,0.05)]">
              <p className="px-3 pb-1 pt-1 text-[11px] font-bold uppercase tracking-widest text-dzb-faint">
                Espace admin
              </p>
              {ADMIN_NAV_ITEMS.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition",
                      active
                        ? "bg-dzb-tint shadow-[inset_0_0_0_1px_rgba(247,169,33,0.35)]"
                        : "hover:bg-dzb-cream"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition",
                        active
                          ? "bg-gradient-to-br from-dzb-amber to-dzb-amberdeep text-white shadow-[0_8px_16px_-8px_rgba(247,169,33,0.9)]"
                          : "bg-dzb-cream text-dzb-muted"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block text-sm font-bold",
                          active ? "text-dzb-navy" : "text-dzb-muted"
                        )}
                      >
                        {item.label}
                      </span>
                      <span className="block truncate text-xs text-dzb-faint">
                        {item.hint}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap gap-2 md:hidden">
              {ADMIN_NAV_ITEMS.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
                      active
                        ? "border-transparent bg-gradient-to-br from-dzb-amber to-dzb-amberdeep text-white shadow-[0_8px_16px_-8px_rgba(247,169,33,0.9)]"
                        : "border-dzb-creamline bg-white text-dzb-muted"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <h1 className="mb-5 hidden items-center gap-2.5 md:flex">
              <span
                aria-hidden
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-dzb-tint text-dzb-amberink"
              >
                {activeItem.icon}
              </span>
              <span className="font-display text-xl font-bold text-dzb-navy">
                {activeItem.label}
              </span>
            </h1>

            {children}
          </main>
        </div>
      </div>
    </AdminTokenContext.Provider>
  );
}
