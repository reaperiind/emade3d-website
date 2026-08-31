"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark, SearchIcon, LogOutIcon, MenuIcon, CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const TOKEN_KEY = "emade3d-admin-token";
const SIDEBAR_KEY = "emade3d-sidebar-collapsed";

const AdminTokenContext = createContext<string>("");
export function useAdminToken(): string {
  return useContext(AdminTokenContext);
}

const NAV_ITEMS = [
  {
    href: "/admin/dashboard",
    label: "Tableau de bord",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "Commandes",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/admin/products",
    label: "Produits",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    href: "/admin/delivery",
    label: "Livraison",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M1 3h15v13H1z" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    href: "/admin/gallery",
    label: "Galerie",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    href: "/admin/info",
    label: "Informations",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved = window.localStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
    const sideState = window.localStorage.getItem(SIDEBAR_KEY);
    if (sideState === "true") setCollapsed(true);
    setReady(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleSidebar = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      window.localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });
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
    } else {
      const err = document.getElementById("login-error");
      if (err) err.classList.remove("hidden");
    }
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0E14]">
        <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
          <LogoMark className="h-7 w-7 text-white" />
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0B0E14] px-4">
        <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="relative w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/25">
              <LogoMark className="h-9 w-9 text-white" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold text-white">
              Emade3D
            </h1>
            <p className="mt-1 text-sm text-steel-400">
              Administration
            </p>
          </div>
          <form onSubmit={onLogin} className="rounded-xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm sm:p-8">
            <label htmlFor="admin-pw" className="mb-2 block text-xs font-medium text-steel-400">
              Mot de passe
            </label>
            <input
              id="admin-pw"
              name="password"
              type="password"
              required
              autoFocus
              placeholder="••••••••"
              onChange={() => document.getElementById("login-error")?.classList.add("hidden")}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-steel-500 transition focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <p id="login-error" className="hidden mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-400">
              Mot de passe incorrect.
            </p>
            <button type="submit" className="mt-5 w-full rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:from-amber-600 hover:to-amber-700 hover:shadow-xl hover:shadow-amber-500/30 active:scale-[0.98]">
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  const activeItem = NAV_ITEMS.find((item) => isActive(pathname, item.href)) ?? NAV_ITEMS[0];

  return (
    <AdminTokenContext.Provider value={token}>
      <div className="flex min-h-screen bg-[#f8f6f1]">
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0B0E14] transition-all duration-300 ease-in-out",
            "lg:sticky lg:z-30",
            collapsed ? "w-[68px]" : "w-[252px]",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className={cn("flex h-16 items-center border-b border-white/[0.06] px-4", collapsed ? "justify-center" : "gap-3")}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
              <LogoMark className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <span className="font-display text-[15px] font-bold text-white">
                Emade3D
              </span>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-steel-400 hover:bg-white/10 hover:text-white lg:hidden"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className={cn("mb-2 px-3", collapsed && "hidden")}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-steel-500">
                Navigation
              </span>
            </div>
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        collapsed && "justify-center px-2",
                        active
                          ? "bg-amber-500/10 text-amber-400"
                          : "text-steel-400 hover:bg-white/[0.06] hover:text-white"
                      )}
                    >
                      <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center transition-colors", active ? "text-amber-400" : "text-steel-500 group-hover:text-steel-300")}>
                        {item.icon}
                      </span>
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-white/[0.06] p-3">
            <button
              type="button"
              onClick={logout}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-steel-400 transition-colors hover:bg-red-500/10 hover:text-red-400",
                collapsed && "justify-center px-2"
              )}
            >
              <LogOutIcon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Déconnexion</span>}
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-dzb-creamline bg-white/80 px-4 backdrop-blur-md sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-dzb-muted hover:bg-dzb-cream lg:hidden"
            >
              <MenuIcon className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden h-8 w-8 items-center justify-center rounded-lg text-dzb-faint hover:bg-dzb-cream hover:text-dzb-muted lg:flex"
              title={collapsed ? "Développer" : "Réduire"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}>
                <path d="M11 17l-5-5 5-5" />
                <path d="M18 17l-5-5 5-5" />
              </svg>
            </button>

            <div className="flex flex-1 items-center">
              <h1 className="font-display text-lg font-bold text-dzb-navy">
                {activeItem.label}
              </h1>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminTokenContext.Provider>
  );
}
