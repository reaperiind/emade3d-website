"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import type { Order } from "@/lib/orders-store";
import type { ProductOrder } from "@/lib/product-orders-store";
import { cn } from "@/lib/cn";
import { useAdminToken } from "../admin-shell";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED: "border-dzb-amber/40 bg-orange-50 text-dzb-amberink",
  UNDER_REVIEW: "border-sky-300 bg-sky-50 text-sky-700",
  QUOTE_SENT: "border-amber-300 bg-amber-50 text-amber-700",
  CONFIRMED: "border-emerald-300 bg-emerald-50 text-emerald-700",
  IN_PRODUCTION: "border-violet-300 bg-violet-50 text-violet-700",
  IN_DESIGN: "border-violet-300 bg-violet-50 text-violet-700",
  DESIGN_APPROVAL: "border-amber-300 bg-amber-50 text-amber-700",
  QUALITY_CHECK: "border-sky-300 bg-sky-50 text-sky-700",
  READY: "border-emerald-300 bg-emerald-50 text-emerald-700",
  DELIVERED: "border-emerald-300 bg-emerald-50 text-emerald-700",
  CLOSED: "border-[#e6d9bf] bg-[#f8f2e5] text-[#5f5975]",
};

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
};

const TONES: Record<string, string> = {
  amber:
    "bg-gradient-to-br from-dzb-amber to-dzb-amberdeep text-white shadow-[0_8px_16px_-8px_rgba(247,169,33,0.9)]",
  sand: "bg-dzb-sand text-dzb-amberink",
  blue: "bg-[#e3ecfb] text-[#3b6fd4]",
  green: "bg-[#e2f5ea] text-[#1f9d61]",
  violet: "bg-[#efe9fb] text-[#7c5cd6]",
};

const BAR_COLORS: Record<string, string> = {
  SUBMITTED: "#f59e0b",
  UNDER_REVIEW: "#3b6fd4",
  QUOTE_SENT: "#e8940a",
  CONFIRMED: "#10b981",
  IN_PRODUCTION: "#7c5cd6",
  IN_DESIGN: "#8b5cf6",
  DESIGN_APPROVAL: "#f59e0b",
  QUALITY_CHECK: "#3b6fd4",
  READY: "#10b981",
  DELIVERED: "#22c55e",
  CLOSED: "#94a3b8",
};

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: keyof typeof TONES;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-[20px] border border-dzb-creamline bg-white p-4 shadow-[0_6px_20px_rgba(27,26,45,0.05)] sm:p-5">
      <span aria-hidden className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", TONES[tone])}>
        {icon}
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-xs font-semibold text-dzb-faint">{label}</p>
        <p className="mt-0.5 font-display text-2xl font-bold text-dzb-navy sm:text-3xl">{value}</p>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label, money = false }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-dzb-creamline bg-white px-3.5 py-2.5 shadow-lg">
      {label != null && <p className="mb-1 text-xs font-semibold text-dzb-muted">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <p key={i} className="flex items-center gap-2 text-sm font-semibold text-dzb-navy">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: entry.color ?? entry.fill }} />
          {money ? `${Number(entry.value ?? 0).toLocaleString("fr-FR")} DA` : entry.value}
        </p>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const token = useAdminToken();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [productRequests, setProductRequests] = useState<ProductOrder[] | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : { orders: [] }))
      .then((json) => setOrders(json.orders ?? []))
      .catch(() => setOrders([]));
    fetch("/api/product-orders", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : { orders: [] }))
      .then((json) => setProductRequests(json.orders ?? []))
      .catch(() => setProductRequests([]));
  }, [token]);

  const stats = useMemo(() => {
    const list = orders ?? [];
    const inProgress = [
      "CONFIRMED",
      "IN_PRODUCTION",
      "IN_DESIGN",
      "DESIGN_APPROVAL",
      "QUALITY_CHECK",
    ];
    return {
      total: list.length,
      pending: list.filter((o) => ["SUBMITTED", "UNDER_REVIEW", "QUOTE_SENT"].includes(o.status)).length,
      inProgress: list.filter((o) => inProgress.includes(o.status)).length,
      finished: list.filter((o) => ["READY", "DELIVERED", "CLOSED"].includes(o.status)).length,
      revenue: list.reduce((sum, o) => sum + (typeof o.price === "number" ? o.price : 0), 0),
      productTotal: (productRequests ?? []).length,
    };
  }, [orders, productRequests]);

  const recentOrders = useMemo(
    () =>
      [...(orders ?? [])]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [orders]
  );

  const recentProducts = useMemo(
    () =>
      [...(productRequests ?? [])]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [productRequests]
  );

  const activityChart = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const dayStart = d.getTime();
      const dayEnd = dayStart + 86400000;
      const count = (orders ?? []).filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= dayStart && t < dayEnd;
      }).length;
      days.push({ label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), count });
    }
    return days;
  }, [orders]);

  const statusChart = useMemo(() => {
    const map: Record<string, number> = {};
    (orders ?? []).forEach((o) => {
      map[o.status] = (map[o.status] ?? 0) + 1;
    });
    return Object.keys(map).map((status) => ({
      status,
      label: STATUS_LABELS[status] ?? status,
      count: map[status],
      color: BAR_COLORS[status] ?? "#94a3b8",
    }));
  }, [orders]);

  if (orders === null) {
    return <p className="py-14 text-center text-[#9a97a6]">Chargement…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard label="Commandes totales" value={stats.total} tone="amber" icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" strokeLinejoin="round" /><path d="M3.3 8.3L12 13l8.7-4.7M12 13v9" strokeLinejoin="round" /></svg>
        } />
        <StatCard label="En attente" value={stats.pending} tone="sand" icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        } />
        <StatCard label="En cours" value={stats.inProgress} tone="blue" icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M12 3a9 9 0 109 9" strokeLinecap="round" /><circle cx="12" cy="12" r="3.2" /></svg>
        } />
        <StatCard label="Finalisées" value={stats.finished} tone="green" icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><circle cx="12" cy="12" r="8.5" /><path d="M8.5 12.2l2.4 2.4 4.6-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        } />
        <StatCard label="Demandes produits" value={stats.productTotal} tone="violet" icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
        } />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[20px] border border-dzb-creamline bg-white p-5 shadow-[0_6px_20px_rgba(27,26,45,0.05)] lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-dzb-navy">Activité des commandes</h2>
              <p className="text-xs text-dzb-faint">Commandes reçues sur les 14 derniers jours</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityChart} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="orderArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f7a921" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#f7a921" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e6d2" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9a97a6" }} tickLine={false} axisLine={{ stroke: "#f0e6d2" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "#9a97a6" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="count" name="Commandes" stroke="#e8940a" strokeWidth={2.5} fill="url(#orderArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[20px] border border-dzb-creamline bg-white p-5 shadow-[0_6px_20px_rgba(27,26,45,0.05)]">
          <h2 className="font-display text-base font-bold text-dzb-navy">Répartition par statut</h2>
          <p className="text-xs text-dzb-faint">Commandes en cours</p>
          <div className="mt-4 h-56">
            {statusChart.length === 0 ? (
              <p className="py-16 text-center text-sm text-[#9a97a6]">Aucune donnée.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChart} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide allowDecimals={false} />
                  <YAxis type="category" dataKey="label" width={86} tick={{ fontSize: 11, fill: "#6b6878" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "#fff8ec" }} />
                  <Bar dataKey="count" name="Commandes" radius={[0, 4, 4, 0]} barSize={16}>
                    {statusChart.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          {stats.revenue > 0 && (
            <div className="mt-3 rounded-xl bg-gradient-to-br from-dzb-tint to-white px-4 py-3">
              <p className="text-xs font-semibold text-dzb-faint">Chiffre d&apos;affaires estimé</p>
              <p className="mt-0.5 font-display text-xl font-bold text-dzb-navy">
                {stats.revenue.toLocaleString("fr-FR")} DA
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[20px] border border-dzb-creamline bg-white p-5 shadow-[0_6px_20px_rgba(27,26,45,0.05)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-dzb-navy">Dernières commandes</h2>
            <Link href="/admin/orders" className="rounded-full border-2 border-dzb-navy/10 px-3.5 py-1.5 text-xs font-semibold text-dzb-muted transition hover:border-dzb-amber hover:text-dzb-amberink">
              Voir tout
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#9a97a6]">Aucune commande pour le moment.</p>
          ) : (
            <ul className="divide-y divide-[#f8f2e5]">
              {recentOrders.map((o) => (
                <li key={o.code} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-extrabold tracking-wider text-dzb-amberink">{o.code}</span>
                    <p className="truncate text-sm font-semibold text-[#2b2b46]">{o.firstName} {o.lastName}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-[#9a97a6]">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</span>
                    <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", STATUS_STYLES[o.status] ?? "border-[#e6d9bf] bg-[#f8f2e5] text-[#5f5975]")}>
                      {STATUS_LABELS[o.status] ?? o.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-[20px] border border-dzb-creamline bg-white p-5 shadow-[0_6px_20px_rgba(27,26,45,0.05)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-dzb-navy">Demandes d&apos;achat récentes</h2>
            <Link href="/admin/products" className="rounded-full border-2 border-dzb-navy/10 px-3.5 py-1.5 text-xs font-semibold text-dzb-muted transition hover:border-dzb-amber hover:text-dzb-amberink">
              Gérer la boutique
            </Link>
          </div>
          {recentProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#9a97a6]">Aucune demande pour le moment.</p>
          ) : (
            <ul className="divide-y divide-[#f8f2e5]">
              {recentProducts.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#2b2b46]">
                      {typeof p.productName === "object" ? (p.productName.fr || p.productName.en || "Produit") : p.productName}
                    </p>
                    <p className="truncate text-xs text-dzb-faint">{p.customerName}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs font-semibold text-dzb-amberink">×{p.quantity}</span>
                    <span className="text-xs text-[#9a97a6]">{new Date(p.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-[20px] border border-dzb-creamline bg-gradient-to-br from-dzb-tint to-white p-5 shadow-[0_6px_20px_rgba(27,26,45,0.05)]">
        <h2 className="font-display text-base font-bold text-dzb-navy">Accès rapide</h2>
        <ul className="mt-3 grid gap-2 text-sm font-semibold sm:grid-cols-3">
          <li><Link href="/admin/delivery" className="flex items-center gap-2 text-dzb-muted transition hover:text-dzb-amberink"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7V8z" /></svg> Frais & wilayas</Link></li>
          <li><Link href="/admin/gallery" className="flex items-center gap-2 text-dzb-muted transition hover:text-dzb-amberink"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg> Galerie</Link></li>
          <li><Link href="/admin/info" className="flex items-center gap-2 text-dzb-muted transition hover:text-dzb-amberink"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg> Coordonnées</Link></li>
        </ul>
      </div>
    </div>
  );
}
