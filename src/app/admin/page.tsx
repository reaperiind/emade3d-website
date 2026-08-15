"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  LogoMark,
  LogOutIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/ui/icons";
import type { Order, OrderStatus } from "@/lib/orders-store";
import { statusesFor } from "@/lib/order-flows";
import type { HistoryEntry } from "@/lib/order-flows";
import type { Commune, Office, Wilaya } from "@/lib/settings-store";
import { cn } from "@/lib/cn";

const TOKEN_KEY = "emade3d-admin-token";

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Commande reçue",
  UNDER_REVIEW: "En étude",
  QUOTE_SENT: "Devis envoyé",
  CONFIRMED: "Confirmée",
  IN_PRODUCTION: "En fabrication",
  IN_DESIGN: "En conception",
  DESIGN_APPROVAL: "Validation design",
  QUALITY_CHECK: "Contrôle qualité",
  READY: "Prête",
  DELIVERED: "Livrée",
  CLOSED: "Clôturée",
  new: "Commande reçue",
  processing: "En cours",
  shipped: "Expédiée",
  done: "Terminée",
  cancelled: "Annulée",
};

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED: "border-accent/40 bg-accent-dim text-accent",
  UNDER_REVIEW: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  QUOTE_SENT: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  CONFIRMED: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  IN_PRODUCTION: "border-violet-400/40 bg-violet-400/10 text-violet-300",
  IN_DESIGN: "border-violet-400/40 bg-violet-400/10 text-violet-300",
  DESIGN_APPROVAL: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  QUALITY_CHECK: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  READY: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  DELIVERED: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  CLOSED: "border-steel-500/40 bg-ink-700/60 text-steel-300",
  new: "border-accent/40 bg-accent-dim text-accent",
  processing: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  shipped: "border-violet-400/40 bg-violet-400/10 text-violet-300",
  done: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  cancelled: "border-red-400/40 bg-red-400/10 text-red-300",
};

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value: string): string {
  return new Date(value).toISOString();
}

/**
 * Admin-side settings. The public GET has no courier credentials anymore —
 * delivery data (wilayas / communes / offices / fees) is managed manually or
 * imported from an Excel file.
 */
interface AdminSettings {
  currency: string;
  delivery: {
    pickupAvailable: boolean;
    pickupNote: string;
    homeFee: number;
    offices: Office[];
    wilayas?: Wilaya[];
    communes?: Commune[];
  };
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"orders" | "settings" | "media">("orders");

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
      i === index ? { ...h, at: fromLocalInput(value) } : h
    );
    setOrders((prev) =>
      prev.map((o) => (o.code === code ? { ...o, history } : o))
    );
    patchOrder(code, { history });
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
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Toutes" value={stats.total} />
          <StatCard label="En attente" value={stats.pending} accent />
          <StatCard label="En cours" value={stats.inProgress} />
          <StatCard label="Finalisées" value={stats.finished} />
        </div>

        {/* Site navigation (dropdown) */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <label
            htmlFor="admin-nav"
            className="text-sm font-semibold text-steel-300"
          >
            Page :
          </label>
          <select
            id="admin-nav"
            value={tab}
            onChange={(e) =>
              setTab(e.target.value as "orders" | "settings" | "media")
            }
            className="w-52 rounded-md border border-white/12 bg-ink-900 px-3 py-2 text-sm text-white focus:border-accent/60 focus:outline-none"
          >
            <option value="orders">📦 Commandes</option>
            <option value="settings">⚙️ Paramètres</option>
            <option value="media">🎬 Media</option>
          </select>
        </div>

        {tab === "orders" && (
          <OrdersPanel
            orders={orders}
            loading={loading}
            stats={stats}
            onStatus={setStatus}
            onPrice={setPrice}
            onDeliveryFee={setDeliveryFee}
            onHistoryAt={setHistoryAt}
            onDelete={onDelete}
          />
        )}
        {tab === "settings" && <SettingsPanel token={token} />}
        {tab === "media" && <MediaPanel />}
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
          <button type="submit" className="btn-primary btn-md mt-5 w-full">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}

function OrdersPanel({
  orders,
  loading,
  stats,
  onStatus,
  onPrice,
  onDeliveryFee,
  onHistoryAt,
  onDelete,
}: {
  orders: Order[];
  loading: boolean;
  stats: { total: number; pending: number; inProgress: number; finished: number };
  onStatus: (code: string, status: OrderStatus) => void;
  onPrice: (code: string, raw: string) => void;
  onDeliveryFee: (code: string, raw: string) => void;
  onHistoryAt: (code: string, index: number, value: string) => void;
  onDelete: (code: string) => void;
}) {
  return (
    <div className="space-y-6">
      {loading ? (
        <p className="text-muted py-10 text-center">Chargement…</p>
      ) : orders.length === 0 ? (
        <p className="card rounded-xl border-white/10 py-14 text-center text-muted">
          Aucune commande pour le moment.
        </p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.code}
              order={order}
              onStatus={onStatus}
              onPrice={onPrice}
              onDeliveryFee={onDeliveryFee}
              onHistoryAt={onHistoryAt}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderCard({
  order,
  onStatus,
  onPrice,
  onDeliveryFee,
  onHistoryAt,
  onDelete,
}: {
  order: Order;
  onStatus: (code: string, status: OrderStatus) => void;
  onPrice: (code: string, raw: string) => void;
  onDeliveryFee: (code: string, raw: string) => void;
  onHistoryAt: (code: string, index: number, value: string) => void;
  onDelete: (code: string) => void;
}) {
  const options = statusesFor(order.serviceType);
  const isCourier = order.delivery?.method === "courier";
  const [priceDraft, setPriceDraft] = useState<string>(() =>
    order.price == null ? "" : String(order.price)
  );
  const [feeDraft, setFeeDraft] = useState<string>(() =>
    String(order.delivery?.fee ?? 0)
  );
  const [savedFlash, setSavedFlash] = useState(false);
  const hasUnsaved =
    priceDraft.trim() === ""
      ? order.price != null
      : Number(priceDraft) !== order.price ||
        String(order.delivery?.fee ?? 0) !== feeDraft;

  async function saveOrder() {
    onPrice(order.code, priceDraft);
    if (isCourier) onDeliveryFee(order.code, feeDraft);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);
  }

  return (
    <li className="card rounded-xl border-white/10 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-extrabold tracking-wider text-accent">
              {order.code}
            </span>
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                STATUS_STYLES[order.status] ??
                  "border-white/20 bg-ink-800 text-steel-300"
              )}
            >
              {STATUS_LABELS[order.status] ?? order.status}
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
            onChange={(e) => onStatus(order.code, e.target.value as OrderStatus)}
            className="rounded-md border border-white/12 bg-ink-900 px-3 py-1.5 text-sm text-white focus:border-accent/60 focus:outline-none"
          >
            {options.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s] ?? s}
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

      {/* Price + delivery fee */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-steel-400">
            Prix (visible du client dès « Devis envoyé »)
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={priceDraft}
            onChange={(e) => setPriceDraft(e.target.value)}
            placeholder="—"
            className="w-full rounded-md border border-white/12 bg-ink-900 px-3 py-1.5 text-sm text-white placeholder:text-steel-600 focus:border-accent/60 focus:outline-none"
          />
        </div>
        {isCourier ? (
          <div>
            <label className="mb-1 block text-xs font-medium text-steel-400">
              Frais de livraison
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={feeDraft}
              onChange={(e) => setFeeDraft(e.target.value)}
              className="w-full rounded-md border border-white/12 bg-ink-900 px-3 py-1.5 text-sm text-white focus:border-accent/60 focus:outline-none"
            />
          </div>
        ) : (
          <p className="flex items-center justify-center rounded-md border border-white/10 bg-ink-800 px-3 py-1.5 text-xs text-steel-400">
            Retrait sur place — gratuit
          </p>
        )}
      </div>

      {/* Delivery summary */}
      {order.delivery && (
        <p className="mt-3 rounded-lg bg-ink-800/60 px-3 py-2 text-xs leading-relaxed text-steel-300">
          Livraison :{" "}
          {order.delivery.method === "courier"
            ? order.delivery.option === "home"
              ? `À domicile${order.delivery.address ? ` — ${order.delivery.address}` : ""}${order.delivery.communeName ? ` / ${order.delivery.communeName}` : ""}`
              : `Bureau du coursier — ${order.delivery.officeId ?? "—"}`
            : "Retrait sur place"}
        </p>
      )}

      {order.description && (
        <p className="mt-3 rounded-lg bg-ink-800/60 px-3 py-2.5 text-sm leading-relaxed text-steel-200">
          {order.description}
        </p>
      )}

      {/* History (editable timestamps) */}
      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-widest text-steel-400">
          Historique (date & heure)
        </p>
        <ul className="mt-2 space-y-2">
          {order.history.map((entry, index) => (
            <li
              key={`${entry.status}-${index}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-ink-800/60 px-3 py-2"
            >
              <span className="text-sm font-medium text-white">
                {STATUS_LABELS[entry.status] ?? entry.status}
              </span>
              <input
                type="datetime-local"
                value={toLocalInput(entry.at)}
                onChange={(e) => onHistoryAt(order.code, index, e.target.value)}
                className="rounded-md border border-white/12 bg-ink-900 px-2.5 py-1 text-sm text-white focus:border-accent/60 focus:outline-none"
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Save changes */}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
        <p className="text-xs">
          {savedFlash ? (
            <span className="text-emerald-300">
              Modifications enregistrées ✓
            </span>
          ) : hasUnsaved ? (
            <span className="text-amber-300">Modifications non enregistrées</span>
          ) : (
            <span className="text-steel-500">Aucune modification</span>
          )}
        </p>
        <button
          type="button"
          onClick={saveOrder}
          disabled={!hasUnsaved}
          className="btn-primary btn-sm disabled:opacity-50"
        >
          Enregistrer
        </button>
      </div>
    </li>
  );
}

function MediaPanel() {
  return (
    <div className="mt-6 space-y-6">
      <div className="card rounded-xl border-white/10 p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-white">
          🎬 Media
        </h2>
        <p className="text-muted mt-1 text-sm leading-relaxed">
          Cette page est vide pour le moment. Les médias (photos, vidéos,
          galeries) seront ajoutés plus tard.
        </p>
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

function SettingsPanel({ token }: { token: string }) {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [communeWilayaFilter, setCommuneWilayaFilter] = useState<number | "all">(
    "all"
  );

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const s = json?.settings as AdminSettings | undefined;
        if (s) setSettings(s);
      })
      .catch(() => undefined);
  }, []);

  function updateWilaya(index: number, patch: Partial<Wilaya>) {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            delivery: {
              ...prev.delivery,
              wilayas: (prev.delivery.wilayas ?? []).map((w, i) =>
                i === index ? { ...w, ...patch } : w
              ),
            },
          }
        : prev
    );
    setSaved(false);
  }

  function removeWilaya(index: number) {
    const prev = settings;
    if (!prev) return;
    if (prev.delivery.wilayas == null) return;
    const removed = prev.delivery.wilayas[index];
    if (!removed) return;
    if (
      !window.confirm(
        `Supprimer la wilaya ${removed.name} et ses communes ?`
      )
    )
      return;
    const communes = (prev.delivery.communes ?? []).filter(
      (c) => c.wilayaId !== removed.id
    );
    setSettings(() => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        wilayas: prev.delivery.wilayas!.filter((_, i) => i !== index),
        communes,
      },
    }));
    setSaved(false);
  }

  /** Auto-id: max wilaya id + 1. */
  function addWilaya() {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            delivery: {
              ...prev.delivery,
              wilayas: [
                ...(prev.delivery.wilayas ?? []),
                {
                  id:
                    (prev.delivery.wilayas ?? []).length > 0
                      ? Math.max(...(prev.delivery.wilayas ?? []).map((w) => w.id)) +
                        1
                      : 1,
                  name: "",
                  homeFee: 0,
                },
              ],
            },
          }
        : prev
    );
    setSaved(false);
  }

  function updateCommune(index: number, patch: Partial<Commune>) {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            delivery: {
              ...prev.delivery,
              communes: (prev.delivery.communes ?? []).map((c, i) =>
                i === index ? { ...c, ...patch } : c
              ),
            },
          }
        : prev
    );
    setSaved(false);
  }

  function addCommune() {
    if (!settings) return;
    const wilayas = settings.delivery.wilayas ?? [];
    const targetWilaya =
      communeWilayaFilter === "all"
        ? wilayas.length === 1
          ? wilayas[0]
          : null
        : wilayas.find((w) => w.id === communeWilayaFilter) ?? null;
    if (targetWilaya == null) return; // pick a wilaya filter first when >1
    const existingIds = (settings.delivery.communes ?? [])
      .filter((c) => c.wilayaId === targetWilaya.id)
      .map((c) => c.id);
    const nextId =
      existingIds.length > 0
        ? Math.max(...existingIds) + 1
        : targetWilaya.id * 10000 + 1;
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            delivery: {
              ...prev.delivery,
              communes: [
                ...(prev.delivery.communes ?? []),
                {
                  id: nextId,
                  wilayaId: targetWilaya.id,
                  name: "",
                },
              ],
            },
          }
        : prev
    );
    setSaved(false);
  }

  function removeCommune(index: number) {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            delivery: {
              ...prev.delivery,
              communes: (prev.delivery.communes ?? []).filter((_, i) => i !== index),
            },
          }
        : prev
    );
    setSaved(false);
  }

  async function onSave() {
    if (!settings) return;
    setSaving(true);
    setError(false);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        setError(true);
        return;
      }
      const json = await res.json();
      if (json.settings) setSettings(json.settings);
      setSaved(true);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  async function onImportFile(file: File) {
    if (!token) return;
    setImporting(true);
    setImportMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/delivery/import", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        counts?: { wilayas: number; communes: number; offices: number };
        total?: { wilayas: number; communes: number; offices: number };
        log?: string[];
        error?: string;
      } | null;
      if (res.ok && json?.ok && json?.counts) {
        setImportMsg({
          ok: true,
          text: `Importé : ${json.counts.wilayas} wilayas, ${json.counts.communes} communes, ${json.counts.offices} bureaux. Totals : ${json.total?.wilayas} / ${json.total?.communes} / ${json.total?.offices}.${json.log?.length ? ` ${json.log.join(" ")}` : ""}`,
        });
        const sres = await fetch("/api/settings");
        const sjson = await sres.json();
        if (sjson.settings) setSettings(sjson.settings);
      } else {
        setImportMsg({ ok: false, text: `Erreur : ${json?.error ?? "inconnue"}` });
      }
    } catch {
      setImportMsg({ ok: false, text: "Erreur réseau." });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (!settings) {
    return (
      <p className="text-muted mt-10 text-center">
        Chargement des paramètres…
      </p>
    );
  }

  const input =
    "w-full rounded-md border border-white/12 bg-ink-900 px-3 py-2 text-sm text-white placeholder:text-steel-600 focus:border-accent/60 focus:outline-none";
  const wilayas = settings.delivery.wilayas ?? [];
  const communes = settings.delivery.communes ?? [];
  const visibleCommunes =
    communeWilayaFilter === "all"
      ? communes
      : communes.filter((c) => c.wilayaId === communeWilayaFilter);

  const hasCommuneWithoutHomeFee =
    wilayas.length > 0 && wilayas.some((w) => !w.homeFee);

  return (
    <div className="mt-6 space-y-6">
      {/* Données de livraison (manuelles) */}
      <div className="card rounded-xl border-white/10 p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-white">
          Données de livraison
        </h2>
        <p className="text-muted mt-1 text-sm leading-relaxed">
          Saisissez manuellement les wilayas et les communes, ou importez-les
          depuis un fichier Excel. Chaque wilaya a un prix à domicile et un
          prix bureau (stop-desk), tous deux utilisés par la page commande.
        </p>

        {/* Excel import */}
        <div className="mt-4 rounded-lg border border-dashed border-white/15 bg-ink-900/40 p-4">
          <p className="text-sm font-medium text-steel-200">
            Importer depuis Excel (.xlsx / .xls / .csv)
          </p>
          <p className="text-muted mt-1 text-xs leading-relaxed">
            Le fichier peut contenir des feuilles ou colonnes nommées&nbsp;:
            wilayas (nom, prix à domicile, prix bureau), communes (commune +
            wilaya). Format Guepex pris en charge (« Destination », « Tarif à
            domicile », « Tarif stop-desk »). Les colonnes sont détectées
            automatiquement (français, arabe ou anglais).
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImportFile(f);
              }}
              className="block w-full max-w-sm text-sm text-steel-300 file:mr-3 file:rounded-md file:border-none file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:cursor-pointer hover:file:bg-accent/90"
            />
            {importing && <span className="text-sm text-steel-400">Import…</span>}
          </div>
          {importMsg && (
            <p
              className={cn(
                "mt-2 text-sm",
                importMsg.ok ? "text-emerald-300" : "text-red-300"
              )}
            >
              {importMsg.text}
            </p>
          )}
        </div>

        {/* Wilayas */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-steel-200">
              Wilayas ({wilayas.length}) — prix domicile & bureau
            </p>
            <button type="button" onClick={addWilaya} className="btn-outline btn-sm">
              <PlusIcon className="h-4 w-4" />
              Ajouter
            </button>
          </div>
          {hasCommuneWithoutHomeFee && (
            <p className="mt-2 flex items-center gap-2 rounded-md border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs text-amber-200">
              Certaines wilayas n&apos;ont pas de prix : le tarif général sera
              utilisé pour elles.
            </p>
          )}
          <div className="mt-3 space-y-2.5">
            {wilayas.map((w, index) => (
              <div
                key={w.id}
                className="grid gap-2.5 rounded-lg border border-white/10 bg-ink-800/60 p-3 sm:grid-cols-[100px_1.2fr_1.2fr_110px_110px_auto]"
              >
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-steel-400">
                    Id
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={w.id}
                    onChange={(e) =>
                      updateWilaya(index, { id: Number(e.target.value) || 0 })
                    }
                    className={input}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-steel-400">
                    Nom
                  </label>
                  <input
                    value={w.name}
                    onChange={(e) => updateWilaya(index, { name: e.target.value })}
                    placeholder="Alger"
                    className={input}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-steel-400">
                    Nom arabe (optionnel)
                  </label>
                  <input
                    value={w.nameAr ?? ""}
                    onChange={(e) => updateWilaya(index, { nameAr: e.target.value })}
                    placeholder="الجزائر"
                    dir="rtl"
                    className={input}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-steel-400">
                    Prix domicile
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={w.homeFee}
                    onChange={(e) =>
                      updateWilaya(index, { homeFee: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0"
                    className={input}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-steel-400">
                    Prix bureau
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={w.stopDeskFee ?? ""}
                    onChange={(e) =>
                      updateWilaya(index, {
                        stopDeskFee: parseFloat(e.target.value) || undefined,
                      })
                    }
                    placeholder="0"
                    className={input}
                  />
                </div>
                <button
                  type="button"
                  aria-label="Supprimer la wilaya"
                  onClick={() => removeWilaya(index)}
                  className="mt-5 flex h-8 w-8 items-center justify-center self-start rounded-md border border-white/10 text-steel-400 transition hover:border-red-400/40 hover:text-red-300"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {wilayas.length === 0 && (
              <p className="rounded-lg bg-ink-800/60 px-3 py-3 text-xs text-steel-400">
                Aucune wilaya : la livraison ne sera pas proposée tant que le
                catalogue n&apos;est pas rempli (manuellement ou via Excel).
              </p>
            )}
          </div>
        </div>

        {/* Communes */}
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-steel-200">
              Communes ({communes.length})
            </p>
            <div className="flex items-center gap-2">
              <select
                value={communeWilayaFilter}
                onChange={(e) =>
                  setCommuneWilayaFilter(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
                className={cn(input, "w-56 appearance-none")}
              >
                <option value="all">Toutes les wilayas</option>
                {wilayas.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addCommune}
                disabled={wilayas.length === 0}
                className="btn-outline btn-sm disabled:opacity-50"
              >
                <PlusIcon className="h-4 w-4" />
                Ajouter
              </button>
            </div>
          </div>
          <p className="text-muted mt-1 text-xs">
            Sélectionnez une wilaya pour gérer ses communes puis « Ajouter ».
          </p>
          <div className="mt-3 space-y-2">
            {visibleCommunes.map((c, index) => {
              const globalIndex = communes.findIndex((x) => x.id === c.id && x.wilayaId === c.wilayaId);
              const wilayaName = wilayas.find((w) => w.id === c.wilayaId)?.name ?? "—";
              return (
                <div
                  key={`${c.wilayaId}-${c.id}`}
                  className="grid grid-cols-[120px_1fr_1.2fr_auto] items-center gap-2.5 rounded-lg border border-white/10 bg-ink-800/60 p-3"
                >
                  <span className="text-xs text-steel-500">{wilayaName}</span>
                  <div>
                    <input
                      value={c.name}
                      onChange={(e) =>
                        updateCommune(globalIndex, { name: e.target.value })
                      }
                      placeholder="Bab Ezzouar"
                      className={input}
                    />
                  </div>
                  <div>
                    <input
                      value={c.nameAr ?? ""}
                      onChange={(e) =>
                        updateCommune(globalIndex, { nameAr: e.target.value })
                      }
                      placeholder="باب الزوار"
                      dir="rtl"
                      className={input}
                    />
                  </div>
                  <button
                    type="button"
                    aria-label="Supprimer la commune"
                    onClick={() => removeCommune(globalIndex)}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-steel-400 transition hover:border-red-400/40 hover:text-red-300"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
            {visibleCommunes.length === 0 && (
              <p className="rounded-lg bg-ink-800/60 px-3 py-3 text-xs text-steel-400">
                {communeWilayaFilter === "all"
                  ? "Aucune commune : les clients pourront quand même choisir une wilaya pour la livraison à domicile."
                  : "Aucune commune pour cette wilaya."}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="btn-primary btn-md mt-6"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          Impossible d&apos;enregistrer les paramètres.
        </p>
      )}
      {saved && (
        <p className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm text-emerald-300">
          Paramètres enregistrés.
        </p>
      )}
    </div>
  );
}