"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { LogoMark, LogOutIcon } from "@/components/ui/icons";
import type { Order, OrderStatus } from "@/lib/orders-store";
import type { HistoryEntry } from "@/lib/order-flows";
import { cn } from "@/lib/cn";
import { OrdersPanel } from "./orders-panel";
import { DeliverySettingsPanel } from "./delivery-settings-panel";
import { InfoSettingsPanel } from "./info-settings-panel";
import { GalleryPanel } from "./gallery-panel";
import {
  inputClass,
  labelClass,
  panelCard,
  saveButton,
} from "./admin-types";

const TOKEN_KEY = "emade3d-admin-token";

const NAV_ITEMS = [
  { id: "orders", label: "Commandes", icon: "📦" },
  { id: "settings", label: "Livraison", icon: "🚚" },
  { id: "info", label: "Informations", icon: "ℹ️" },
  { id: "gallery", label: "Galerie", icon: "🖼️" },
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
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container-site flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white">
              <LogoMark className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold text-slate-900">
              Emade3D <span className="text-accent">Admin</span>
            </span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
          >
            <LogOutIcon className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        {/* Left sidebar */}
        <aside className="hidden w-56 shrink-0 md:block">
          <nav
            className={cn(
              panelCard,
              "sticky top-24 space-y-1 p-3"
            )}
          >
            <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Espace admin
            </p>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setNav(item.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition",
                  nav === item.id
                    ? "bg-accent text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="mb-4 flex flex-wrap gap-2 md:hidden">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setNav(item.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition",
                nav === item.id
                  ? "border-accent bg-accent text-white"
                  : "border-slate-300 bg-white text-slate-600"
              )}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {/* Stats (only on orders home) */}
          {nav === "orders" && (
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Toutes" value={stats.total} />
              <StatCard label="En attente" value={stats.pending} accent />
              <StatCard label="En cours" value={stats.inProgress} />
              <StatCard label="Finalisées" value={stats.finished} />
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-white shadow-lg">
            <LogoMark className="h-8 w-8" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">
            Emade3D <span className="text-accent">Admin</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">Accès réservé</p>
        </div>
        <form onSubmit={onLogin} className={cn(panelCard, "p-6 sm:p-8")}>
          <label htmlFor="admin-password" className={labelClass}>
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
            className={cn(inputClass, "py-3")}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">
              Mot de passe incorrect.
            </p>
          )}
          <button type="submit" className={cn(saveButton, "mt-5 w-full py-3")}>
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        panelCard,
        "p-4",
        accent && "border-accent/40 bg-accent/5"
      )}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-display text-3xl font-bold",
          accent ? "text-accent" : "text-slate-900"
        )}
      >
        {value}
      </p>
    </div>
  );
}