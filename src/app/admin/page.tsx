"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { LogoMark, LogOutIcon } from "@/components/ui/icons";
import type { Order, OrderStatus } from "@/lib/orders-store";
import type { HistoryEntry } from "@/lib/order-flows";
import { cn } from "@/lib/cn";
import { OrdersPanel } from "./orders-panel";
import { DeliverySettingsPanel } from "./delivery-settings-panel";
import { InfoSettingsPanel } from "./info-settings-panel";
import { GalleryPanel } from "./gallery-panel";
import { ProductsPanel } from "./products-panel";

const TOKEN_KEY = "emade3d-admin-token";

const NAV_ITEMS = [
  {
    id: "orders",
    label: "Commandes",
    hint: "Suivi des projets",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" strokeLinejoin="round" />
        <path d="M3.3 8.3L12 13l8.7-4.7M12 13v9" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "products",
    label: "Produits",
    hint: "Boutique & demandes",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M6 7h12l1.5 12.5a1.5 1.5 0 01-1.5 1.5H6a1.5 1.5 0 01-1.5-1.5L6 7z" strokeLinejoin="round" />
        <path d="M9 10V6a3 3 0 016 0v4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Livraison",
    hint: "Wilayas, communes, frais",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M2 7h11v10H2zM13 10h4l4 3.5V17h-8" strokeLinejoin="round" />
        <circle cx="6.5" cy="17.5" r="1.8" />
        <circle cx="16.5" cy="17.5" r="1.8" />
      </svg>
    ),
  },
  {
    id: "info",
    label: "Informations",
    hint: "Contact, réseaux sociaux",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 7.5v.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "gallery",
    label: "Galerie",
    hint: "Réalisations",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <rect x="3" y="4" width="18" height="16" rx="2.5" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="M3 17l5.2-4.6a1.5 1.5 0 012 0L15 17m-2.8-2.5l2-1.8a1.5 1.5 0 012 0L21 16.5" strokeLinejoin="round" />
      </svg>
    ),
  },
] as const;

type NavId = (typeof NAV_ITEMS)[number]["id"];

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [nav, setNav] = useState<NavId>("orders");

  useEffect(() => {
    const saved = window.localStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          window.localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          return;
        }
        const json = await res.json();
        if (!cancelled) setOrders(json.orders ?? []);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [token]);

  const stats = useMemo(() => {
    const inProgress = [
      "CONFIRMED",
      "IN_PRODUCTION",
      "IN_DESIGN",
      "DESIGN_APPROVAL",
      "QUALITY_CHECK",
    ];
    return {
      total: orders.length,
      pending: orders.filter((o) =>
        ["SUBMITTED", "UNDER_REVIEW", "QUOTE_SENT"].includes(o.status)
      ).length,
      inProgress: orders.filter((o) => inProgress.includes(o.status)).length,
      finished: orders.filter((o) =>
        ["READY", "DELIVERED", "CLOSED"].includes(o.status)
      ).length,
    };
  }, [orders]);

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
    setOrders([]);
    setNav("orders");
  }

  const patchOrder = useCallback(
    async (code: string, body: Record<string, unknown>) => {
      const before = orders;
      const res = await fetch(`/api/orders/${encodeURIComponent(code)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const json = await res.json();
        const updated = json.order as Order | undefined;
        if (updated) {
          setOrders((prev) =>
            prev.map((o) => (o.code === code ? updated : o))
          );
          return;
        }
      }
      setOrders(before);
    },
    [orders, token]
  );

  function setStatus(code: string, status: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) =>
        o.code === code
          ? {
              ...o,
              status,
              history: [...o.history, { status, at: new Date().toISOString() }],
            }
          : o
      )
    );
    patchOrder(code, { status });
  }

  function setPrice(code: string, raw: string) {
    const value = raw.trim() === "" ? null : parseFloat(raw);
    const next = Number.isFinite(value as number) ? (value as number) : null;
    setOrders((prev) =>
      prev.map((o) => (o.code === code ? { ...o, price: next } : o))
    );
    patchOrder(code, { price: next });
  }

  function setDeliveryFee(code: string, raw: string) {
    const value = parseFloat(raw);
    const fee = Number.isFinite(value) ? value : 0;
    setOrders((prev) =>
      prev.map((o) =>
        o.code === code && o.delivery
          ? { ...o, delivery: { ...o.delivery, fee } }
          : o
      )
    );
    const order = orders.find((o) => o.code === code);
    if (order?.delivery) {
      patchOrder(code, {
        delivery: { ...order.delivery, fee },
      });
    }
  }

  function setHistoryAt(code: string, index: number, value: string) {
    const order = orders.find((o) => o.code === code);
    if (!order) return;
    const history: HistoryEntry[] = order.history.map((h, i) =>
      i === index ? { ...h, at: new Date(value).toISOString() } : h
    );
    setOrders((prev) =>
      prev.map((o) => (o.code === code ? { ...o, history } : o))
    );
    patchOrder(code, { history });
  }

  function removeHistoryAt(code: string, index: number) {
    const order = orders.find((o) => o.code === code);
    if (!order || order.history.length <= 1) return;
    const history = order.history.filter((_, i) => i !== index);
    const status = history[history.length - 1].status;
    setOrders((prev) =>
      prev.map((o) => (o.code === code ? { ...o, history, status } : o))
    );
    patchOrder(code, { history, status });
  }

  function setFiles(code: string, files: Order["files"]) {
    setOrders((prev) =>
      prev.map((o) => (o.code === code ? { ...o, files } : o))
    );
    patchOrder(code, { files });
  }

  async function onDelete(code: string) {
    if (!window.confirm(`Supprimer la commande ${code} ?`)) return;
    try {
      await fetch(`/api/orders/${encodeURIComponent(code)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders((prev) => prev.filter((o) => o.code !== code));
    } catch {
      /* ignore */
    }
  }

  if (!token) {
    return <LoginForm error={loginError} onLogin={onLogin} onChange={() => setLoginError(false)} />;
  }

  return (
    <div className="min-h-screen bg-dzb-cream text-dzb-navy">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-dzb-creamline bg-white/85 backdrop-blur-md">
        <div className="container-site flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
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
          </div>
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
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 md:block">
          <nav className="sticky top-24 space-y-1.5 rounded-[20px] border border-dzb-creamline bg-white p-3 shadow-[0_6px_20px_rgba(27,26,45,0.05)]">
            <p className="px-3 pb-1 pt-1 text-[11px] font-bold uppercase tracking-widest text-dzb-faint">
              Espace admin
            </p>
            {NAV_ITEMS.map((item) => {
              const active = nav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setNav(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
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
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main column */}
        <main className="min-w-0 flex-1">
          {/* Mobile nav */}
          <div className="mb-4 flex flex-wrap gap-2 md:hidden">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setNav(item.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
                  nav === item.id
                    ? "border-transparent bg-gradient-to-br from-dzb-amber to-dzb-amberdeep text-white shadow-[0_8px_16px_-8px_rgba(247,169,33,0.9)]"
                    : "border-dzb-creamline bg-white text-dzb-muted"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {nav === "orders" && (
            <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <StatCard
                label="Toutes"
                value={stats.total}
                tone="amber"
                icon={<LogoMark className="h-5 w-5" />}
              />
              <StatCard
                label="En attente"
                value={stats.pending}
                tone="sand"
                icon={<ClockIcon />}
              />
              <StatCard
                label="En cours"
                value={stats.inProgress}
                tone="blue"
                icon={<SpinnerIcon />}
              />
              <StatCard
                label="Finalisées"
                value={stats.finished}
                tone="green"
                icon={<CheckIcon />}
              />
            </div>
          )}

          {nav === "orders" && (
            <OrdersPanel
              orders={orders}
              loading={loading}
              token={token}
              onStatus={setStatus}
              onPrice={setPrice}
              onDeliveryFee={setDeliveryFee}
              onHistoryAt={setHistoryAt}
              onHistoryRemove={removeHistoryAt}
              onDelete={onDelete}
              onFilesChange={setFiles}
            />
          )}
          {nav === "settings" && <DeliverySettingsPanel token={token} />}
          {nav === "info" && <InfoSettingsPanel token={token} />}
          {nav === "gallery" && <GalleryPanel token={token} />}
          {nav === "products" && <ProductsPanel token={token} />}
        </main>
      </div>
    </div>
  );
}

function LoginForm({
  error,
  onLogin,
  onChange,
}: {
  error: boolean;
  onLogin: (e: FormEvent<HTMLFormElement>) => void;
  onChange: () => void;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-dzb-cream px-4">
      {/* Soft brand blobs */}
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
            onChange={onChange}
            placeholder="••••••••"
            className="w-full rounded-xl border border-[#e6d9bf] bg-white px-4 py-3 text-sm text-dzb-navy placeholder:text-[#b3ab9c] transition focus:border-dzb-amber focus:outline-none focus:ring-4 focus:ring-dzb-amber/15"
          />
          {error && (
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

const TONES: Record<string, { tile: string; value: string }> = {
  amber: {
    tile: "bg-gradient-to-br from-dzb-amber to-dzb-amberdeep text-white shadow-[0_8px_16px_-8px_rgba(247,169,33,0.9)]",
    value: "text-dzb-navy",
  },
  sand: { tile: "bg-dzb-sand text-dzb-amberink", value: "text-dzb-navy" },
  blue: { tile: "bg-[#e3ecfb] text-[#3b6fd4]", value: "text-dzb-navy" },
  green: { tile: "bg-[#e2f5ea] text-[#1f9d61]", value: "text-dzb-navy" },
};

function StatCard({
  label,
  value,
  tone = "sand",
  icon,
}: {
  label: string;
  value: number;
  tone?: keyof typeof TONES;
  icon?: ReactNode;
}) {
  const t = TONES[tone] ?? TONES.sand;
  return (
    <div className="flex items-center gap-3.5 rounded-[20px] border border-dzb-creamline bg-white p-4 shadow-[0_6px_20px_rgba(27,26,45,0.05)] sm:p-5">
      {icon && (
        <span
          aria-hidden
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            t.tile
          )}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0 leading-tight">
        <p className="truncate text-xs font-semibold text-dzb-faint">{label}</p>
        <p className={cn("mt-0.5 font-display text-2xl font-bold sm:text-3xl", t.value)}>
          {value}
        </p>
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M12 3a9 9 0 109 9" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.2l2.4 2.4 4.6-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
