"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import type { Order } from "@/lib/orders-store";
import { cn } from "@/lib/cn";
import { useAdminToken } from "../admin-shell";

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
      <span
        aria-hidden
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          TONES[tone]
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-xs font-semibold text-dzb-faint">{label}</p>
        <p className="mt-0.5 font-display text-2xl font-bold text-dzb-navy sm:text-3xl">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const token = useAdminToken();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [productRequests, setProductRequests] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : { orders: [] }))
      .then((json) => setOrders(json.orders ?? []))
      .catch(() => setOrders([]));
    fetch("/api/product-orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : { orders: [] }))
      .then((json) => setProductRequests((json.orders ?? []).length))
      .catch(() => setProductRequests(0));
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
      pending: list.filter((o) =>
        ["SUBMITTED", "UNDER_REVIEW", "QUOTE_SENT"].includes(o.status)
      ).length,
      inProgress: list.filter((o) => inProgress.includes(o.status)).length,
      finished: list.filter((o) =>
        ["READY", "DELIVERED", "CLOSED"].includes(o.status)
      ).length,
    };
  }, [orders]);

  const recent = useMemo(
    () =>
      [...(orders ?? [])]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [orders]
  );

  if (orders === null) {
    return (
      <p className="py-14 text-center text-[#9a97a6]">Chargement…</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Commandes totales"
          value={stats.total}
          tone="amber"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" strokeLinejoin="round" />
              <path d="M3.3 8.3L12 13l8.7-4.7M12 13v9" strokeLinejoin="round" />
            </svg>
          }
        />
        <StatCard
          label="En attente"
          value={stats.pending}
          tone="sand"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <StatCard
          label="En cours"
          value={stats.inProgress}
          tone="blue"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M12 3a9 9 0 109 9" strokeLinecap="round" />
              <circle cx="12" cy="12" r="3.2" />
            </svg>
          }
        />
        <StatCard
          label="Finalisées"
          value={stats.finished}
          tone="green"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M8.5 12.2l2.4 2.4 4.6-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[20px] border border-dzb-creamline bg-white p-5 shadow-[0_6px_20px_rgba(27,26,45,0.05)] lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-dzb-navy">
              Dernières commandes
            </h2>
            <Link
              href="/admin/orders"
              className="rounded-full border-2 border-dzb-navy/10 px-3.5 py-1.5 text-xs font-semibold text-dzb-muted transition hover:border-dzb-amber hover:text-dzb-amberink"
            >
              Voir tout
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#9a97a6]">
              Aucune commande pour le moment.
            </p>
          ) : (
            <ul className="divide-y divide-[#f8f2e5]">
              {recent.map((o) => (
                <li key={o.code} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-extrabold tracking-wider text-dzb-amberink">
                      {o.code}
                    </span>
                    <p className="truncate text-sm font-semibold text-[#2b2b46]">
                      {o.firstName} {o.lastName}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-[#9a97a6]">
                      {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs font-semibold",
                        STATUS_STYLES[o.status] ??
                          "border-[#e6d9bf] bg-[#f8f2e5] text-[#5f5975]"
                      )}
                    >
                      {STATUS_LABELS[o.status] ?? o.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <Link
            href="/admin/products"
            className="block rounded-[20px] border border-dzb-creamline bg-gradient-to-br from-dzb-tint to-white p-5 shadow-[0_6px_20px_rgba(27,26,45,0.05)] transition hover:shadow-[0_14px_30px_-12px_rgba(247,169,33,0.4)]"
          >
            <p className="text-xs font-semibold text-dzb-faint">
              Demandes d&apos;achat produits
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-dzb-navy">
              {productRequests ?? "—"}
            </p>
            <p className="mt-1 text-xs font-medium text-dzb-amberink">
              Gérer la boutique →
            </p>
          </Link>

          <div className="rounded-[20px] border border-dzb-creamline bg-white p-5 shadow-[0_6px_20px_rgba(27,26,45,0.05)]">
            <h2 className="font-display text-base font-bold text-dzb-navy">
              Accès rapide
            </h2>
            <ul className="mt-3 space-y-2 text-sm font-semibold">
              <li>
                <Link href="/admin/delivery" className="text-dzb-muted transition hover:text-dzb-amberink">
                  → Frais de livraison & wilayas
                </Link>
              </li>
              <li>
                <Link href="/admin/gallery" className="text-dzb-muted transition hover:text-dzb-amberink">
                  → Galerie des réalisations
                </Link>
              </li>
              <li>
                <Link href="/admin/info" className="text-dzb-muted transition hover:text-dzb-amberink">
                  → Coordonnées de contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
