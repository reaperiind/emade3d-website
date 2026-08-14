"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CogIcon,
  LogoMark,
  LogOutIcon,
  TrashIcon,
} from "@/components/ui/icons";
import {
  ORDER_STATUSES,
  type Order,
  type OrderStatus,
} from "@/lib/orders-store";
import { cn } from "@/lib/cn";

const TOKEN_KEY = "emade3d-admin-token";

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Nouveau",
  processing: "En cours",
  shipped: "Expédiée",
  done: "Terminée",
  cancelled: "Annulée",
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  new: "border-accent/40 bg-accent-dim text-accent",
  processing: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  shipped: "border-violet-400/40 bg-violet-400/10 text-violet-300",
  done: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  cancelled: "border-red-400/40 bg-red-400/10 text-red-300",
};

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"orders" | "settings">("orders");

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
    const by = (s: OrderStatus) => orders.filter((o) => o.status === s).length;
    return {
      total: orders.length,
      new: by("new"),
      processing: by("processing"),
      done: by("done"),
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
  }

  async function setStatus(code: string, status: OrderStatus) {
    const before = orders;
    setOrders((prev) =>
      prev.map((o) => (o.code === code ? { ...o, status } : o))
    );
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(code)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) setOrders(before);
    } catch {
      setOrders(before);
    }
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
    return (
      <LoginForm
        error={loginError}
        onLogin={onLogin}
        onChange={() => setLoginError(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-ink-950 text-steel-100">
      <header className="border-b border-white/10 bg-ink-900/60 backdrop-blur">
        <div className="container-site flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-7 w-7 text-accent" />
            <span className="font-display text-lg font-bold text-white">
              Emade3D <span className="text-accent">Admin</span>
            </span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-steel-300 transition hover:text-white"
          >
            <LogOutIcon className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </header>

      <div className="container-site px-4 py-8 sm:px-6">
        {/* Tabs */}
        <div className="flex gap-2">
          <TabButton
            active={tab === "orders"}
            onClick={() => setTab("orders")}
            icon={<CogIcon className="h-4 w-4" />}
          >
            Commandes
          </TabButton>
          <TabButton
            active={tab === "settings"}
            onClick={() => setTab("settings")}
            icon={<CogIcon className="h-4 w-4" />}
          >
            Paramètres
          </TabButton>
        </div>

        {tab === "settings" ? (
          <SettingsPanel />
        ) : (
          <OrdersPanel
            orders={orders}
            loading={loading}
            stats={stats}
            onStatus={setStatus}
            onDelete={onDelete}
          />
        )}
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-accent/30 bg-accent-dim text-accent">
            <LogoMark className="h-8 w-8" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-white">
            Emade3D <span className="text-accent">Admin</span>
          </h1>
          <p className="text-muted mt-1 text-sm">Accès réservé</p>
        </div>
        <form
          onSubmit={onLogin}
          className="card rounded-xl border-white/10 p-6 sm:p-8"
        >
          <label
            htmlFor="admin-password"
            className="mb-1.5 block text-sm font-medium text-steel-300"
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
            className="w-full rounded-md border border-white/12 bg-ink-900 px-4 py-3 text-sm text-white placeholder:text-steel-500 focus:border-accent/60 focus:outline-none"
          />
          {error && (
            <p className="mt-2 text-sm text-red-300">
              Mot de passe incorrect.
            </p>
          )}
          <button
            type="submit"
            className="btn-primary btn-md mt-5 w-full"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-4 py-2 text-sm font-semibold transition",
        active
          ? "bg-accent text-white"
          : "bg-ink-800 text-steel-200 hover:bg-ink-700"
      )}
    >
      <span className="flex items-center gap-1.5">
        {icon}
        {children}
      </span>
    </button>
  );
}

function OrdersPanel({
  orders,
  loading,
  stats,
  onStatus,
  onDelete,
}: {
  orders: Order[];
  loading: boolean;
  stats: { total: number; new: number; processing: number; done: number };
  onStatus: (code: string, status: OrderStatus) => void;
  onDelete: (code: string) => void;
}) {
  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Toutes" value={stats.total} />
        <StatCard label="Nouvelles" value={stats.new} accent />
        <StatCard label="En cours" value={stats.processing} />
        <StatCard label="Terminées" value={stats.done} />
      </div>

      {loading ? (
        <p className="text-muted py-10 text-center">Chargement…</p>
      ) : orders.length === 0 ? (
        <p className="card rounded-xl border-white/10 py-14 text-center text-muted">
          Aucune commande pour le moment.
        </p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li
              key={order.code}
              className="card rounded-xl border-white/10 p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-extrabold tracking-wider text-accent">
                      {order.code}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                        STATUS_STYLES[order.status]
                      )}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-white">
                    {order.firstName} {order.lastName} ·{" "}
                    <span dir="ltr">{order.phone}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-steel-400">
                    {new Date(order.createdAt).toLocaleString("fr-FR")} ·{" "}
                    {order.serviceType.replace(/_/g, " ")}
                    {order.orderDate ? ` · ${order.orderDate}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      onStatus(order.code, e.target.value as OrderStatus)
                    }
                    className="rounded-md border border-white/12 bg-ink-900 px-3 py-1.5 text-sm text-white focus:border-accent/60 focus:outline-none"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    aria-label={`Supprimer ${order.code}`}
                    onClick={() => onDelete(order.code)}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-steel-400 transition hover:border-red-400/40 hover:text-red-300"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {order.description && (
                <p className="mt-3 rounded-lg bg-ink-800/60 px-3 py-2.5 text-sm leading-relaxed text-steel-200">
                  {order.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
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
        "card rounded-xl border-white/10 p-4",
        accent && "border-accent/30 bg-accent-dim"
      )}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-steel-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-display text-3xl font-bold",
          accent ? "text-accent" : "text-white"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div className="mt-6">
      <div className="card rounded-xl border-white/10 p-8 text-center">
        <CogIcon className="mx-auto h-10 w-10 text-steel-400" />
        <h2 className="mt-4 font-display text-xl font-semibold text-white">
          Paramètres du site
        </h2>
        <p className="text-muted mx-auto mt-2 max-w-md text-sm leading-relaxed">
          Cette section permettra de modifier les informations du site
          (contact, réseaux sociaux, coordonnées…). Elle sera construite dans
          la prochaine étape.
        </p>
      </div>
    </div>
  );
}