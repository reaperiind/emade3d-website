"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CogIcon,
  LogoMark,
  LogOutIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/ui/icons";
import type { Order, OrderStatus } from "@/lib/orders-store";
import { statusesFor } from "@/lib/order-flows";
import type { HistoryEntry } from "@/lib/order-flows";
import type { Commune, CourierConfig, Office, Wilaya } from "@/lib/settings-store";
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
 * Admin-side settings: the public GET hides courier credentials, but the
 * settings panel needs to edit them. apiId / apiToken are optional here so a
 * blank field means "keep the stored value".
 */
interface AdminCourier extends Omit<CourierConfig, "apiId" | "apiToken"> {
  apiId?: string;
  apiToken?: string;
  hasCredentials?: boolean;
}

interface AdminSettings {
  currency: string;
  delivery: {
    pickupAvailable: boolean;
    pickupNote: string;
    homeFee: number;
    offices: Office[];
    wilayas?: Wilaya[];
    communes?: Commune[];
    courier?: AdminCourier;
  };
}

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

  function onShipmentCreated(
    code: string,
    shipment: { tracking: string; id?: string; createdAt: string }
  ) {
    setOrders((prev) =>
      prev.map((o) => (o.code === code ? { ...o, shipment } : o))
    );
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
          <SettingsPanel token={token} />
        ) : (
          <OrdersPanel
            orders={orders}
            loading={loading}
            stats={stats}
            onStatus={setStatus}
            onPrice={setPrice}
            onDeliveryFee={setDeliveryFee}
            onHistoryAt={setHistoryAt}
            onShipment={onShipmentCreated}
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
          <button type="submit" className="btn-primary btn-md mt-5 w-full">
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
  onPrice,
  onDeliveryFee,
  onHistoryAt,
  onShipment,
  onDelete,
}: {
  orders: Order[];
  loading: boolean;
  stats: { total: number; pending: number; inProgress: number; finished: number };
  onStatus: (code: string, status: OrderStatus) => void;
  onPrice: (code: string, raw: string) => void;
  onDeliveryFee: (code: string, raw: string) => void;
  onHistoryAt: (code: string, index: number, value: string) => void;
  onShipment: (
    code: string,
    shipment: { tracking: string; id?: string; createdAt: string }
  ) => void;
  onDelete: (code: string) => void;
}) {
  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Toutes" value={stats.total} />
        <StatCard label="En attente" value={stats.pending} accent />
        <StatCard label="En cours" value={stats.inProgress} />
        <StatCard label="Finalisées" value={stats.finished} />
      </div>

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
              onShipment={onShipment}
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
  onShipment,
  onDelete,
}: {
  order: Order;
  onStatus: (code: string, status: OrderStatus) => void;
  onPrice: (code: string, raw: string) => void;
  onDeliveryFee: (code: string, raw: string) => void;
  onHistoryAt: (code: string, index: number, value: string) => void;
  onShipment: (
    code: string,
    shipment: { tracking: string; id?: string; createdAt: string }
  ) => void;
  onDelete: (code: string) => void;
}) {
  const options = statusesFor(order.serviceType);
  const isCourier = order.delivery?.method === "courier";
  const [shipOpen, setShipOpen] = useState(false);
  const [shipWeight, setShipWeight] = useState("1");
  const [shipLength, setShipLength] = useState("");
  const [shipWidth, setShipWidth] = useState("");
  const [shipHeight, setShipHeight] = useState("");
  const [shipInsurance, setShipInsurance] = useState(false);
  const [shipDeclared, setShipDeclared] = useState("");
  const [shipSending, setShipSending] = useState(false);
  const [shipError, setShipError] = useState<string | null>(null);
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

  async function createShipment() {
    setShipSending(true);
    setShipError(null);
    try {
      const res = await fetch("/api/courier/shipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.localStorage.getItem(TOKEN_KEY) ?? ""}`,
        },
        body: JSON.stringify({
          code: order.code,
          weight: parseFloat(shipWeight) || 0,
          length: parseFloat(shipLength) || 0,
          width: parseFloat(shipWidth) || 0,
          height: parseFloat(shipHeight) || 0,
          doInsurance: shipInsurance,
          declaredValue: parseFloat(shipDeclared) || 0,
        }),
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        shipment?: { tracking: string; id?: string; createdAt: string };
        error?: string;
      } | null;
      if (res.ok && json?.shipment) {
        onShipment(order.code, json.shipment);
        setShipOpen(false);
      } else {
        setShipError(json?.error ?? "shipment_failed");
      }
    } catch {
      setShipError("network");
    } finally {
      setShipSending(false);
    }
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

      {/* Guepex shipment */}
      {isCourier && (
        <div className="mt-3">
          {order.shipment?.tracking ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm">
              <span className="text-emerald-300">Shène Guepex créée</span>
              <a
                href={`https://guepex.app/tracking/${encodeURIComponent(
                  order.shipment.tracking
                )}`}
                target="_blank"
                rel="noreferrer"
                dir="ltr"
                className="font-mono font-bold text-emerald-200 hover:underline"
              >
                {order.shipment.tracking}
              </a>
            </div>
          ) : shipOpen ? (
            <div className="rounded-lg border border-white/10 bg-ink-800/60 p-3">
              <p className="mb-2 text-xs font-semibold text-steel-300">
                Créer la shène Guepex
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shipWeight}
                  onChange={(e) => setShipWeight(e.target.value)}
                  placeholder="Poids (kg)"
                  className="w-full rounded-md border border-white/12 bg-ink-900 px-2.5 py-1.5 text-sm text-white placeholder:text-steel-600 focus:border-accent/60 focus:outline-none"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shipLength}
                  onChange={(e) => setShipLength(e.target.value)}
                  placeholder="Long. (cm)"
                  className="w-full rounded-md border border-white/12 bg-ink-900 px-2.5 py-1.5 text-sm text-white placeholder:text-steel-600 focus:border-accent/60 focus:outline-none"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shipWidth}
                  onChange={(e) => setShipWidth(e.target.value)}
                  placeholder="Larg. (cm)"
                  className="w-full rounded-md border border-white/12 bg-ink-900 px-2.5 py-1.5 text-sm text-white placeholder:text-steel-600 focus:border-accent/60 focus:outline-none"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shipHeight}
                  onChange={(e) => setShipHeight(e.target.value)}
                  placeholder="Haut. (cm)"
                  className="w-full rounded-md border border-white/12 bg-ink-900 px-2.5 py-1.5 text-sm text-white placeholder:text-steel-600 focus:border-accent/60 focus:outline-none"
                />
              </div>
              <label className="mt-2 flex items-center gap-2 text-xs text-steel-300">
                <input
                  type="checkbox"
                  checked={shipInsurance}
                  onChange={(e) => setShipInsurance(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#FF5A1F]"
                />
                Assurance
              </label>
              {shipInsurance && (
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={shipDeclared}
                  onChange={(e) => setShipDeclared(e.target.value)}
                  placeholder="Valeur déclarée (DA)"
                  className="mt-2 w-full rounded-md border border-white/12 bg-ink-900 px-2.5 py-1.5 text-sm text-white placeholder:text-steel-600 focus:border-accent/60 focus:outline-none"
                />
              )}
              {shipError && <p className="mt-2 text-xs text-red-300">{shipError}</p>}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={createShipment}
                  disabled={shipSending}
                  className="btn-primary btn-sm disabled:opacity-60"
                >
                  {shipSending ? "Création…" : "Créer"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShipOpen(false);
                    setShipError(null);
                  }}
                  className="btn-outline btn-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShipOpen(true)}
              className="btn-outline btn-sm"
            >
              <PlusIcon className="h-4 w-4" />
              Créer la shène Guepex
            </button>
          )}
        </div>
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
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(
    null
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

  function update<K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  function updateDelivery<K extends keyof AdminSettings["delivery"]>(
    key: K,
    value: AdminSettings["delivery"][K]
  ) {
    setSettings((prev) =>
      prev ? { ...prev, delivery: { ...prev.delivery, [key]: value } } : prev
    );
    setSaved(false);
  }

  function updateCourier(patch: Partial<AdminCourier>) {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            delivery: {
              ...prev.delivery,
              courier: {
                provider: "guepex",
                name: "Guepex",
                enabled: false,
                fromWilayaId: null,
                ...(prev.delivery.courier ?? {}),
                ...patch,
              },
            },
          }
        : prev
    );
    setSaved(false);
  }

  function updateOffice(index: number, patch: Partial<Office>) {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            delivery: {
              ...prev.delivery,
              offices: prev.delivery.offices.map((o, i) =>
                i === index ? { ...o, ...patch } : o
              ),
            },
          }
        : prev
    );
    setSaved(false);
  }

  function addOffice() {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            delivery: {
              ...prev.delivery,
              offices: [
                ...prev.delivery.offices,
                { id: `office-${Date.now()}`, name: "", address: "", fee: 0 },
              ],
            },
          }
        : prev
    );
    setSaved(false);
  }

  function removeOffice(index: number) {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            delivery: {
              ...prev.delivery,
              offices: prev.delivery.offices.filter((_, i) => i !== index),
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

  async function onImport() {
    if (!token) return;
    setImporting(true);
    setImportMsg(null);
    try {
      const res = await fetch("/api/courier/import", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        counts?: { wilayas: number; communes: number; centers: number };
        error?: string;
      } | null;
      if (res.ok && json?.ok && json?.counts) {
        setImportMsg(
          `Importé : ${json.counts.wilayas} wilayas, ${json.counts.communes} communes, ${json.counts.centers} bureaux.`
        );
        const sres = await fetch("/api/settings");
        const sjson = await sres.json();
        if (sjson.settings) setSettings(sjson.settings);
      } else {
        setImportMsg(`Erreur : ${json?.error ?? "inconnue"}`);
      }
    } catch {
      setImportMsg("Erreur réseau.");
    } finally {
      setImporting(false);
    }
  }

  async function onTest() {
    if (!token) return;
    setTesting(true);
    setTestMsg(null);
    try {
      const res = await fetch("/api/courier/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          apiId: courier?.apiId ?? "",
          apiToken: courier?.apiToken ?? "",
        }),
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        counts?: { wilayas: number; communes: number; centers: number };
        error?: string;
      } | null;
      if (res.ok && json?.ok) {
        setTestMsg({
          ok: true,
          text:
            json.counts != null
              ? `Connexion réussie : ${json.counts.wilayas} wilayas, ${json.counts.communes} communes, ${json.counts.centers} bureaux.`
              : "Connexion réussie.",
        });
      } else {
        setTestMsg({ ok: false, text: `Échec : ${json?.error ?? "inconnue"}` });
      }
    } catch {
      setTestMsg({ ok: false, text: "Erreur réseau." });
    } finally {
      setTesting(false);
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
  const courier = settings.delivery.courier;
  const hasCredentials = Boolean(courier?.hasCredentials);
  const wilayas = settings.delivery.wilayas ?? [];

  return (
    <div className="mt-6 space-y-6">
      {/* Service de livraison (Guepex) */}
      <div className="card rounded-xl border-white/10 p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-white">
          Service de livraison
        </h2>
        <p className="text-muted mt-1 text-sm leading-relaxed">
          Connectez le site à l&apos;API Guepex (identifiants depuis votre
          tableau de bord Guepex). Les wilayas, communes et bureaux sont ensuite
          importés puis proposés aux clients, avec des prix calculés par
          l&apos;API. Le token n&apos;est jamais affiché au client.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-steel-400">
              Société de livraison
            </label>
            <input
              value={courier?.name ?? "Guepex"}
              onChange={(e) => updateCourier({ name: e.target.value })}
              className={input}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-steel-400">
              API ID
            </label>
            <input
              value={courier?.apiId ?? ""}
              onChange={(e) => updateCourier({ apiId: e.target.value })}
              placeholder={
                hasCredentials
                  ? "•••••• (laisser vide pour conserver)"
                  : "API ID"
              }
              autoComplete="off"
              className={input}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-steel-400">
              API TOKEN
            </label>
            <input
              type="password"
              value={courier?.apiToken ?? ""}
              onChange={(e) => updateCourier({ apiToken: e.target.value })}
              placeholder={
                hasCredentials
                  ? "•••••• (laisser vide pour conserver)"
                  : "API TOKEN"
              }
              autoComplete="off"
              className={input}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-steel-400">
              Wilaya d&apos;expédition (origine)
            </label>
            <select
              value={courier?.fromWilayaId ?? ""}
              onChange={(e) =>
                updateCourier({
                  fromWilayaId: e.target.value ? Number(e.target.value) : null,
                })
              }
              className={cn(input, "appearance-none")}
            >
              <option value="">Choisissez la wilaya d&apos;origine</option>
              {wilayas.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="mt-4 flex items-center gap-2.5 text-sm font-medium text-steel-200">
          <input
            type="checkbox"
            checked={Boolean(courier?.enabled)}
            onChange={(e) => updateCourier({ enabled: e.target.checked })}
            className="h-4 w-4 accent-[#FF5A1F]"
          />
          Activer l&apos;intégration Guepex (communes + prix calculés)
        </label>

        {courier?.lastImportedAt && (
          <p className="mt-3 text-xs text-steel-400">
            Dernier import :{" "}
            {new Date(courier.lastImportedAt).toLocaleString("fr-FR")}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onTest}
            disabled={testing}
            className="btn-outline-accent btn-md disabled:opacity-60"
          >
            {testing ? "Test en cours…" : "Test de connexion"}
          </button>
          <button
            type="button"
            onClick={onImport}
            disabled={importing}
            className="btn-primary btn-md disabled:opacity-60"
          >
            {importing ? "Import…" : "Importer wilayas / communes / bureaux"}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="btn-outline btn-md"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
        {testMsg && (
          <p
            className={cn(
              "mt-3 rounded-md border px-4 py-2.5 text-sm",
              testMsg.ok
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            )}
          >
            {testMsg.text}
          </p>
        )}
        {importMsg && (
          <p
            className={cn(
              "mt-3 text-sm",
              importMsg.startsWith("Erreur")
                ? "text-red-300"
                : "text-emerald-300"
            )}
          >
            {importMsg}
          </p>
        )}
        {error && (
          <p className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
            Impossible d&apos;enregistrer les paramètres.
          </p>
        )}
        {saved && (
          <p className="mt-3 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm text-emerald-300">
            Paramètres enregistrés.
          </p>
        )}
      </div>

      {/* Livraison & devis */}
      <div className="card rounded-xl border-white/10 p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-white">
          Livraison & devis
        </h2>
        <p className="text-muted mt-1 text-sm leading-relaxed">
          Ces informations restent les valeurs de secours quand l&apos;API
          Guepex est indisponible.
        </p>

        <div className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-steel-400">
                Devise affichée (ex. DA, €, DZD)
              </label>
              <input
                value={settings.currency}
                onChange={(e) => update("currency", e.target.value)}
                className={input}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-steel-400">
                Frais de livraison à domicile (secours)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={settings.delivery.homeFee}
                onChange={(e) =>
                  updateDelivery("homeFee", parseFloat(e.target.value) || 0)
                }
                className={input}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2.5 text-sm font-medium text-steel-200">
              <input
                type="checkbox"
                checked={settings.delivery.pickupAvailable}
                onChange={(e) =>
                  updateDelivery("pickupAvailable", e.target.checked)
                }
                className="h-4 w-4 accent-[#FF5A1F]"
              />
              Retrait sur place disponible
            </label>
            <div>
              <label className="mb-1 block text-xs font-medium text-steel-400">
                Note de retrait (adresse / horaires)
              </label>
              <textarea
                rows={2}
                value={settings.delivery.pickupNote}
                onChange={(e) => updateDelivery("pickupNote", e.target.value)}
                className={cn(input, "resize-none")}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-steel-200">
                Bureaux de livraison (importés ou manuels)
              </p>
              <button
                type="button"
                onClick={addOffice}
                className="btn-outline btn-sm"
              >
                <PlusIcon className="h-4 w-4" />
                Ajouter
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {settings.delivery.offices.map((office, index) => (
                <div
                  key={office.id}
                  className="grid gap-3 rounded-xl border border-white/10 bg-ink-800/60 p-3 sm:grid-cols-[1fr_1.2fr_90px_auto]"
                >
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-steel-400">
                      Nom
                    </label>
                    <input
                      value={office.name}
                      onChange={(e) =>
                        updateOffice(index, { name: e.target.value })
                      }
                      placeholder="Bureau Alger"
                      className={input}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-steel-400">
                      Adresse
                    </label>
                    <input
                      value={office.address}
                      onChange={(e) =>
                        updateOffice(index, { address: e.target.value })
                      }
                      placeholder="Rue, ville…"
                      className={input}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-steel-400">
                      Frais
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={office.fee}
                      onChange={(e) =>
                        updateOffice(index, {
                          fee: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={input}
                    />
                  </div>
                  <button
                    type="button"
                    aria-label="Supprimer le bureau"
                    onClick={() => removeOffice(index)}
                    className="mt-6 flex h-9 w-9 items-center justify-center self-start rounded-md border border-white/10 text-steel-400 transition hover:border-red-400/40 hover:text-red-300"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="btn-primary btn-md mt-5"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}