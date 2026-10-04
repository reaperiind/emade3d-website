"use client";

import { useEffect, useMemo, useState } from "react";
import type { Order, OrderStatus } from "@/lib/orders-store";
import { statusesFor, type ProgressNote } from "@/lib/order-flows";
import { cn } from "@/lib/cn";
import { localizePath } from "@/i18n/config";
import {
  TrashIcon,
  WhatsAppIcon,
  DownloadIcon,
  SearchIcon,
  CloseIcon,
  CopyIcon,
  CheckIcon,
  PlusIcon,
  PencilIcon,
} from "@/components/ui/icons";
import {
  inputClass,
  panelCard,
  saveButton,
} from "./admin-types";

export const STATUS_LABELS: Record<string, string> = {
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
  new: "border-dzb-amber/40 bg-orange-50 text-dzb-amberink",
  processing: "border-sky-300 bg-sky-50 text-sky-700",
  shipped: "border-violet-300 bg-violet-50 text-violet-700",
  done: "border-emerald-300 bg-emerald-50 text-emerald-700",
  cancelled: "border-red-300 bg-red-50 text-red-600",
};

const IMAGE_EXT_RE = /\.(png|jpg|jpeg|webp|gif)$/i;

const WA_LABELS: Record<string, Record<string, string>> = {
  fr: {
    SUBMITTED: "reçue",
    UNDER_REVIEW: "en étude",
    QUOTE_SENT: "devis envoyé",
    CONFIRMED: "confirmée",
    IN_PRODUCTION: "en fabrication",
    IN_DESIGN: "en conception",
    DESIGN_APPROVAL: "en validation du design",
    QUALITY_CHECK: "en contrôle qualité",
    READY: "prête",
    DELIVERED: "livrée",
    CLOSED: "clôturée",
  },
  en: {
    SUBMITTED: "received",
    UNDER_REVIEW: "under review",
    QUOTE_SENT: "quote sent",
    CONFIRMED: "confirmed",
    IN_PRODUCTION: "in production",
    IN_DESIGN: "in design",
    DESIGN_APPROVAL: "design approval",
    QUALITY_CHECK: "quality check",
    READY: "ready",
    DELIVERED: "delivered",
    CLOSED: "closed",
  },
  ar: {
    SUBMITTED: "تم استلامها",
    UNDER_REVIEW: "قيد الدراسة",
    QUOTE_SENT: "تم إرسال العرض",
    CONFIRMED: "مؤكدة",
    IN_PRODUCTION: "قيد التصنيع",
    IN_DESIGN: "قيد التصميم",
    DESIGN_APPROVAL: "قيد اعتماد التصميم",
    QUALITY_CHECK: "قيد مراقبة الجودة",
    READY: "جاهزة",
    DELIVERED: "تم التسليم",
    CLOSED: "مغلقة",
  },
};

const WA_TEMPLATES: Record<string, (o: Order) => string> = {
  fr: (o) =>
    `Bonjour ${o.firstName} ${o.lastName},\nvotre commande ${o.code} est passée au statut « ${WA_LABELS.fr[o.status] ?? o.status} ».\nVous pouvez la suivre ici : `,
  en: (o) =>
    `Hello ${o.firstName} ${o.lastName},\nyour order ${o.code} is now ${WA_LABELS.en[o.status] ?? o.status}.\nTrack it here: `,
  ar: (o) =>
    `مرحباً ${o.firstName} ${o.lastName}،\nأصبحت حالة طلبكم ${o.code} « ${WA_LABELS.ar[o.status] ?? o.status} ».\nيمكنكم متابعته هنا: `,
};

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${bytes} o`;
}

function waPhone(order: Order): string {
  const digits = (order.phone ?? "").replace(/\D/g, "");
  if (digits.startsWith("213")) return digits;
  if (digits.startsWith("0")) return `213${digits.slice(1)}`;
  return digits;
}

function waLink(order: Order, locale: "ar" | "fr"): string {
  const number = waPhone(order);
  if (!number) return "";
  const base =
    typeof window !== "undefined" ? window.location.origin : "https://emade3d.dz";
  const path = `${localizePath("/suivre-ma-commande", locale === "ar" ? "ar" : "fr")}?code=${encodeURIComponent(order.code)}`;
  const text = `${WA_TEMPLATES[locale](order)}${base}${path}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

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

type OrderGroupId = "all" | "pending" | "progress" | "done";

const ORDER_GROUPS: { id: OrderGroupId; label: string; statuses: string[] }[] = [
  { id: "all", label: "Toutes", statuses: [] },
  {
    id: "pending",
    label: "En attente",
    statuses: ["SUBMITTED", "UNDER_REVIEW", "QUOTE_SENT"],
  },
  {
    id: "progress",
    label: "En cours",
    statuses: [
      "CONFIRMED",
      "IN_PRODUCTION",
      "IN_DESIGN",
      "DESIGN_APPROVAL",
      "QUALITY_CHECK",
    ],
  },
  { id: "done", label: "Finalisées", statuses: ["READY", "DELIVERED", "CLOSED"] },
];

const ORDERS_PER_PAGE = 10;

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <circle cx="12" cy="5.5" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="12" cy="18.5" r="1.7" />
    </svg>
  );
}

export function OrdersPanel({
  orders,
  loading,
  token,
  onStatus,
  onPrice,
  onDeliveryFee,
  onHistoryAt,
  onHistoryRemove,
  onDelete,
  onFilesChange,
  onSave,
}: {
  orders: Order[];
  loading: boolean;
  token: string;
  onStatus: (code: string, status: OrderStatus) => void;
  onPrice: (code: string, raw: string) => void;
  onDeliveryFee: (code: string, raw: string) => void;
  onHistoryAt: (code: string, index: number, value: string) => void;
  onHistoryRemove: (code: string, index: number) => void;
  onDelete: (code: string) => void;
  onFilesChange: (code: string, files: Order["files"]) => void;
  onSave: (updatedOrder: Order) => void;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<OrderGroupId>("all");
  const [page, setPage] = useState(1);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 1500);
  }

  const counts = useMemo(() => {
    const c: Record<OrderGroupId, number> = {
      all: orders.length,
      pending: 0,
      progress: 0,
      done: 0,
    };
    for (const o of orders) {
      if (ORDER_GROUPS[1].statuses.includes(o.status)) c.pending += 1;
      else if (ORDER_GROUPS[2].statuses.includes(o.status)) c.progress += 1;
      else if (ORDER_GROUPS[3].statuses.includes(o.status)) c.done += 1;
    }
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const active = ORDER_GROUPS.find((g) => g.id === group);
    return orders
      .filter((o) => {
        if (active && active.statuses.length > 0 && !active.statuses.includes(o.status))
          return false;
        if (!q) return true;
        const hay =
          `${o.code} ${o.firstName} ${o.lastName} ${o.phone ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [orders, query, group]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ORDERS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ORDERS_PER_PAGE;
  const visible = filtered.slice(start, start + ORDERS_PER_PAGE);
  const selectedOrder = selectedCode
    ? orders.find((o) => o.code === selectedCode) ?? null
    : null;

  function changeGroup(next: OrderGroupId) {
    setGroup(next);
    setPage(1);
  }

  function changeQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className={cn(panelCard, "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between")}>
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dzb-faint" />
          <input
            value={query}
            onChange={(e) => changeQuery(e.target.value)}
            placeholder="Rechercher par code, nom ou téléphone…"
            className={cn(inputClass, "pl-10 pr-4")}
          />
        </div>
        <div className="rounded-lg bg-dzb-cream p-1">
          <div className="flex flex-wrap gap-1">
            {ORDER_GROUPS.map((g) => {
              const isActive = group === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => changeGroup(g.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold transition-all",
                    isActive
                      ? "bg-white text-dzb-navy shadow-sm"
                      : "text-dzb-muted hover:text-dzb-navy"
                  )}
                >
                  {g.label}
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-bold leading-none",
                      isActive
                        ? "bg-dzb-cream text-dzb-amberink"
                        : "bg-dzb-creamline text-dzb-faint"
                    )}
                  >
                    {counts[g.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {loading ? (
        <div className={cn(panelCard, "py-14 text-center")}>
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-dzb-creamline border-t-dzb-amber" />
          <p className="mt-3 text-sm text-dzb-faint">Chargement…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={cn(panelCard, "py-14 text-center")}>
          <p className="text-sm text-dzb-muted">
            {orders.length === 0
              ? "Aucune commande pour le moment."
              : "Aucune commande ne correspond à la recherche."}
          </p>
        </div>
      ) : (
        <>
          <div className={cn(panelCard, "hidden overflow-hidden !p-0 md:block")}>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-dzb-creamline bg-dzb-cream/50 text-[11px] font-bold uppercase tracking-widest text-dzb-faint">
                  <th className="px-5 py-3.5">Client</th>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Statut</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((order) => (
                  <tr
                    key={order.code}
                    className="group cursor-pointer border-b border-dzb-creamline/60 transition last:border-0 hover:bg-dzb-cream/30"
                    onClick={() => setSelectedCode(order.code)}
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-dzb-navy">
                        {order.firstName} {order.lastName}
                      </p>
                      <p className="text-xs text-dzb-muted" dir="ltr">
                        {order.phone}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(order.code)}
                        className="font-mono text-xs font-extrabold tracking-wider text-dzb-amberink hover:underline flex items-center gap-1"
                        title="نسخ رقم التتبع"
                      >
                        {order.code}
                        {copiedCode === order.code && (
                          <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                        )}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-dzb-muted">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                          STATUS_STYLES[order.status] ??
                            "border-dzb-creamline bg-dzb-cream text-dzb-muted"
                        )}
                      >
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div
                        className="relative inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          aria-label={`Actions pour ${order.code}`}
                          onClick={() =>
                            setMenuFor(menuFor === order.code ? null : order.code)
                          }
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg transition",
                            menuFor === order.code
                              ? "bg-dzb-cream text-dzb-navy"
                              : "text-dzb-faint hover:bg-dzb-cream hover:text-dzb-navy"
                          )}
                        >
                          <DotsIcon />
                        </button>
                        {menuFor === order.code && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setMenuFor(null)}
                            />
                            <div className="absolute right-0 top-full z-40 mt-1 w-44 overflow-hidden rounded-xl border border-dzb-creamline bg-white py-1 shadow-lg">
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuFor(null);
                                  setSelectedCode(order.code);
                                }}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-dzb-navy transition hover:bg-dzb-cream"
                              >
                                <PencilIcon className="h-4 w-4 text-dzb-amberink" />
                                Modifier
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuFor(null);
                                  onDelete(order.code);
                                }}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
                              >
                                <TrashIcon className="h-4 w-4" />
                                Supprimer
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2.5 md:hidden">
            {visible.map((order) => (
              <li
                key={order.code}
                className={cn(panelCard, "p-4")}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCode(order.code)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate font-semibold text-dzb-navy">
                      {order.firstName} {order.lastName}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(order.code);
                      }}
                      className="font-mono text-xs font-extrabold tracking-wider text-dzb-amberink hover:underline flex items-center gap-1"
                      title="نسخ رقم التتبع"
                    >
                      {order.code}
                      {copiedCode === order.code && (
                        <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                    </button>
                  </button>
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      aria-label={`Actions pour ${order.code}`}
                      onClick={() =>
                        setMenuFor(menuFor === order.code ? null : order.code)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-dzb-faint transition hover:bg-dzb-cream hover:text-dzb-navy"
                    >
                      <DotsIcon />
                    </button>
                    {menuFor === order.code && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setMenuFor(null)}
                        />
                        <div className="absolute right-0 top-full z-40 mt-1 w-44 overflow-hidden rounded-xl border border-dzb-creamline bg-white py-1 shadow-lg">
                          <button
                            type="button"
                            onClick={() => {
                              setMenuFor(null);
                              setSelectedCode(order.code);
                            }}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-dzb-navy"
                          >
                            <PencilIcon className="h-4 w-4 text-dzb-amberink" />
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMenuFor(null);
                              onDelete(order.code);
                            }}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-red-500"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Supprimer
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                      STATUS_STYLES[order.status] ??
                        "border-dzb-creamline bg-dzb-cream text-dzb-muted"
                    )}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                  <span className="text-xs text-dzb-faint">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dzb-creamline bg-white px-5 py-3.5 shadow-sm sm:px-6">
              <p className="text-xs font-medium text-dzb-faint">
                {start + 1}–{Math.min(start + ORDERS_PER_PAGE, filtered.length)}{" "}
                sur {filtered.length} commandes
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Page précédente"
                  disabled={safePage === 1}
                  onClick={() => setPage(safePage - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-dzb-creamline text-sm font-bold text-dzb-navy transition hover:border-dzb-amber hover:text-dzb-amberink disabled:opacity-30 disabled:hover:border-dzb-creamline disabled:hover:text-dzb-navy"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 5) return true;
                    if (p === 1 || p === totalPages) return true;
                    if (Math.abs(p - safePage) <= 1) return true;
                    return false;
                  })
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && typeof arr[i - 1] === "number" && p - (arr[i - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`dots-${i}`} className="px-1 text-xs text-dzb-faint">…</span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={cn(
                          "flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition-all",
                          p === safePage
                            ? "bg-dzb-amber text-white shadow-sm"
                            : "text-dzb-muted hover:bg-dzb-cream hover:text-dzb-navy"
                        )}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  type="button"
                  aria-label="Page suivante"
                  disabled={safePage === totalPages}
                  onClick={() => setPage(safePage + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-dzb-creamline text-sm font-bold text-dzb-navy transition hover:border-dzb-amber hover:text-dzb-amberink disabled:opacity-30 disabled:hover:border-dzb-creamline disabled:hover:text-dzb-navy"
                >
                  ›
                </button>
              </div>
            </div>
          )}

          {selectedOrder && (
            <OrderDetailsDrawer
              order={selectedOrder}
              token={token}
              onClose={() => setSelectedCode(null)}
              onStatus={onStatus}
              onPrice={onPrice}
              onDeliveryFee={onDeliveryFee}
              onHistoryAt={onHistoryAt}
              onHistoryRemove={onHistoryRemove}
              onDelete={onDelete}
              onFilesChange={onFilesChange}
              onCopyCode={copyToClipboard}
              copiedCode={copiedCode}
              onSave={onSave}
            />
          )}
        </>
      )}
    </div>
  );
}

function OrderDetailsDrawer({
  order,
  token,
  onClose,
  onStatus,
  onPrice,
  onDeliveryFee,
  onHistoryAt,
  onHistoryRemove,
  onDelete,
  onFilesChange,
  onCopyCode,
  onSave,
  copiedCode,
}: {
  order: Order;
  token: string;
  onClose: () => void;
  onStatus: (code: string, status: OrderStatus) => void;
  onPrice: (code: string, raw: string) => void;
  onDeliveryFee: (code: string, raw: string) => void;
  onHistoryAt: (code: string, index: number, value: string) => void;
  onHistoryRemove: (code: string, index: number) => void;
  onDelete: (code: string) => void;
  onFilesChange: (code: string, files: Order["files"]) => void;
  onCopyCode: (code: string) => void;
  onSave: (updatedOrder: Order) => void;
  copiedCode: string | null;
}) {
  const options = statusesFor(order.serviceType);
  const isCourier = order.delivery?.method === "courier";
  const [priceDraft, setPriceDraft] = useState<string>(() =>
    order.price == null ? "" : String(order.price)
  );
  const [feeDraft, setFeeDraft] = useState<string>(() =>
    String(order.delivery?.fee ?? 0)
  );
  const [statusDraft, setStatusDraft] = useState<OrderStatus>(order.status);
  const [progressNotesDraft, setProgressNotesDraft] = useState<ProgressNote[]>(() => (order.progressNotes ?? []).slice());
  const [savedFlash, setSavedFlash] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [viewer, setViewer] = useState<string | null>(null);
  const waPhoneNumber = waPhone(order);

  const imageFiles = (order.files ?? []).filter((f) => IMAGE_EXT_RE.test(f.name));

  useEffect(() => {
    let cancelled = false;
    for (const file of imageFiles) {
      if (previews[file.key]) continue;
      fetch(`/api/order-files/${encodeURIComponent(file.key)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("load_failed");
          return res.blob();
        })
        .then((blob) => {
          if (!cancelled) {
            setPreviews((prev) => ({
              ...prev,
              [file.key]: URL.createObjectURL(blob),
            }));
          }
        })
        .catch(() => undefined);
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.code]);

  // Sync statusDraft when order.status changes from parent
  useEffect(() => {
    setStatusDraft(order.status);
  }, [order.status]);

  useEffect(() => {
    setProgressNotesDraft((order.progressNotes ?? []).slice());
  }, [order.progressNotes]);

  const hasUnsaved =
    priceDraft.trim() === ""
      ? order.price != null
      : Number(priceDraft) !== order.price ||
        String(order.delivery?.fee ?? 0) !== feeDraft ||
        statusDraft !== order.status ||
        JSON.stringify(progressNotesDraft) !== JSON.stringify(
          Object.fromEntries((order.progressNotes ?? []).map((n) => [n.status, n.text]))
        );

  async function saveOrder() {
    const body: Record<string, unknown> = {};
    let hasChanges = false;

    if (statusDraft !== order.status) {
      body.status = statusDraft;
      hasChanges = true;
    }
    // Price
    const priceValue = priceDraft.trim() === "" ? null : Number(priceDraft);
    if (priceValue !== order.price) {
      body.price = priceValue !== null && Number.isFinite(priceValue) && priceValue > 0 ? priceValue : null;
      hasChanges = true;
    }
    // Delivery fee (for courier orders)
    if (order.delivery?.method === "courier") {
      const feeValue = Number(feeDraft);
      if (feeValue !== (order.delivery?.fee ?? 0)) {
        body.delivery = { ...order.delivery, fee: Number.isFinite(feeValue) ? feeValue : 0 };
        hasChanges = true;
      }
    }
    // Progress notes
    const notesChanged = progressNotesDraft.length !== (order.progressNotes ?? []).length ||
      progressNotesDraft.some((note, i) =>
        note.id !== (order.progressNotes ?? [])[i]?.id ||
        note.status !== (order.progressNotes ?? [])[i]?.status ||
        note.text !== (order.progressNotes ?? [])[i]?.text
      );
    if (notesChanged) {
      body.progressNotes = progressNotesDraft.map((note) => ({
        id: note.id,
        status: note.status,
        text: note.text.trim(),
        at: note.at,
      }));
      hasChanges = true;
    }

    if (hasChanges) {
      const res = await fetch(`/api/orders/${encodeURIComponent(order.code)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Save failed:", err);
        alert("فشل الحفظ: " + (err.error || "خطأ غير معروف"));
        return;
      }
      const json = await res.json();
      const updated = json.order as Order | undefined;
      if (updated) {
        // Update local states to match saved data
        if (updated.status) setStatusDraft(updated.status);
        if (updated.price !== undefined) setPriceDraft(updated.price == null ? "" : String(updated.price));
        if (updated.delivery?.fee !== undefined) setFeeDraft(String(updated.delivery.fee));
        if (updated.progressNotes !== undefined) {
          if (updated.progressNotes !== undefined) {
          setProgressNotesDraft((updated.progressNotes ?? []).slice());
        }
        }
      }
      onSave(updated!);
    }
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);
  }

  async function downloadFile(key: string) {
    const res = await fetch(`/api/order-files/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const meta = res.headers.get("Content-Disposition");
    const blob = await res.blob();
    const nameMatch = meta?.match(/filename\*=UTF-8''([^;]+)/i);
    const rawName = nameMatch ? decodeURIComponent(nameMatch[1]) : key;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = rawName;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteFile(key: string) {
    const res = await fetch(`/api/order-files/${encodeURIComponent(key)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    onFilesChange(
      order.code,
      (order.files ?? []).filter((f) => f.key !== key)
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.15)]">
        <header className="sticky top-0 z-10 border-b border-dzb-creamline bg-white/95 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onCopyCode(order.code)}
                  className="font-mono text-sm font-extrabold tracking-wider text-dzb-amberink hover:underline flex items-center gap-1"
                  title="نسخ رقم التتبع"
                >
                  {order.code}
                  {copiedCode === order.code && (
                    <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                  )}
                </button>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                    STATUS_STYLES[order.status] ??
                      "border-dzb-creamline bg-dzb-cream text-dzb-muted"
                  )}
                >
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
              <p className="mt-1.5 text-sm font-semibold text-dzb-navy">
                {order.firstName} {order.lastName} ·{" "}
                <span dir="ltr">{order.phone}</span>
              </p>
              <p className="mt-0.5 text-xs text-dzb-muted">
                {new Date(order.createdAt).toLocaleString("fr-FR")} ·{" "}
                {order.serviceType.replace(/_/g, " ")}
                {order.orderDate ? ` · ${order.orderDate}` : ""}
              </p>
            </div>
            <button
              type="button"
              aria-label="Fermer"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dzb-creamline text-dzb-muted transition hover:border-red-300 hover:bg-red-50 hover:text-red-500"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
            {/* Save button in header */}
            <button
              type="button"
              onClick={saveOrder}
              disabled={!hasUnsaved}
              className={cn(saveButton, "disabled:opacity-50 h-9 ml-2")}
            >
              Enregistrer
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={statusDraft}
                onChange={(e) => {
                  const newStatus = e.target.value as OrderStatus;
                  setStatusDraft(newStatus);
                  onStatus(order.code, newStatus);
                }}
                className={cn(inputClass, "w-auto min-w-44 appearance-none py-2")}
              >
                {options.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s] ?? s}
                  </option>
                ))}
              </select>
              {waPhoneNumber && (
                <div className="flex items-center gap-0.5 rounded-lg border-2 border-green-200 p-0.5">
                  <a
                    href={waLink(order, "ar")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-bold text-green-700 transition hover:bg-green-50"
                    title="Envoyer en arabe"
                  >
                    <WhatsAppIcon className="h-4 w-4 text-green-600" />
                    عربي
                  </a>
                  <a
                    href={waLink(order, "fr")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-bold text-green-700 transition hover:bg-green-50"
                    title="Envoyer en français"
                  >
                    <WhatsAppIcon className="h-4 w-4 text-green-600" />
                    FR
                  </a>
                </div>
              )}
              <button
                type="button"
                onClick={() => onDelete(order.code)}
                className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg border border-dzb-creamline text-dzb-faint transition hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                aria-label={`Supprimer ${order.code}`}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-dzb-muted">
                  Prix (DA)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={priceDraft}
                  onChange={(e) => setPriceDraft(e.target.value)}
                  placeholder="—"
                  className={inputClass}
                />
              </div>
              {isCourier ? (
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-dzb-muted">
                    Frais de livraison (DA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={feeDraft}
                    onChange={(e) => setFeeDraft(e.target.value)}
                    className={inputClass}
                  />
                </div>
              ) : (
                <div className="flex items-end">
                  <p className="rounded-lg border border-dzb-creamline bg-dzb-cream/50 px-3.5 py-2.5 text-xs text-dzb-muted">
                    Retrait sur place — gratuit
                  </p>
                </div>
              )}
</div>

            {order.delivery && (
              <div className="rounded-lg border border-dzb-creamline bg-dzb-cream/40 px-4 py-3 text-xs leading-relaxed text-dzb-muted">
                <span className="font-semibold text-dzb-navy">Livraison : </span>
                {order.delivery.method === "courier"
                  ? order.delivery.option === "home"
                    ? `À domicile${order.delivery.address ? ` — ${order.delivery.address}` : ""}${order.delivery.communeName ? ` / ${order.delivery.communeName}` : ""}`
                    : `Bureau du coursier — ${order.delivery.wilayaId ?? order.delivery.officeId ?? "—"}`
                  : "Retrait sur place"}
              </div>
            )}

            {order.description && (
              <div className="rounded-lg border border-dzb-creamline bg-dzb-cream/40 px-4 py-3 text-sm leading-relaxed text-dzb-muted whitespace-pre-wrap">
                {order.description}
              </div>
            )}

            {order.files && order.files.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-dzb-faint">
                  Fichiers du projet
                </p>
                <ul className="mt-2 space-y-2">
                  {order.files.map((file) => (
                    <li
                      key={file.key}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dzb-creamline bg-dzb-cream/30 px-3 py-2.5 transition hover:bg-dzb-cream/60"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {IMAGE_EXT_RE.test(file.name) &&
                          (previews[file.key] ? (
                            <button
                              type="button"
                              onClick={() => setViewer(previews[file.key])}
                              className="shrink-0 overflow-hidden rounded-md border border-dzb-creamline transition hover:opacity-80"
                            >
                              <img
                                src={previews[file.key]}
                                alt={file.name}
                                className="h-12 w-12 object-cover"
                              />
                            </button>
                          ) : (
                            <span className="h-12 w-12 shrink-0 animate-pulse rounded-md border border-dzb-creamline bg-dzb-creamline/50" />
                          ))}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-dzb-navy">
                            {file.name}
                          </p>
                          <p className="text-xs text-dzb-faint">
                            {formatBytes(file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => downloadFile(file.key)}
                          className="flex h-8 items-center gap-1.5 rounded-md border border-dzb-creamline bg-white px-2.5 text-xs font-medium text-dzb-muted transition hover:border-dzb-amber hover:text-dzb-amberink"
                        >
                          <DownloadIcon className="h-3.5 w-3.5" />
                          Télécharger
                        </button>
                        <button
                          type="button"
                          aria-label={`Supprimer ${file.name}`}
                          onClick={() => deleteFile(file.key)}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-dzb-creamline text-dzb-faint transition hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-dzb-faint">
                Historique
              </p>
              <ul className="mt-2 space-y-2">
                {order.history.map((entry, index) => {
                  const statusNotes = progressNotesDraft.filter((n) => n.status === entry.status);
                  return (
                    <li
                      key={`${entry.status}-${index}`}
                      className="flex flex-col gap-2 rounded-lg border border-dzb-creamline bg-dzb-cream/30 px-3 py-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium text-dzb-navy">
                          {STATUS_LABELS[entry.status] ?? entry.status}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="datetime-local"
                            value={toLocalInput(entry.at)}
                            onChange={(e) => onHistoryAt(order.code, index, e.target.value)}
                            className={cn(inputClass, "w-auto py-1.5 text-xs")}
                          />
                          {index < order.history.length - 1 && (
                            <button
                              type="button"
                              aria-label={`Supprimer l'étape ${STATUS_LABELS[entry.status] ?? entry.status}`}
                              onClick={() => onHistoryRemove(order.code, index)}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-dzb-creamline text-dzb-faint transition hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      {/* Progress notes for this status */}
                      {(() => {
                        const statusNotes = progressNotesDraft.filter((n) => n.status === entry.status);
                        return (
                          <div className="space-y-2 pt-1">
                            {statusNotes.map((note) => (
                              <div key={note.id} className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                  <textarea
                                    value={note.text}
                                    onChange={(e) =>
                                      setProgressNotesDraft(
                                        progressNotesDraft.map((n) =>
                                          n.id === note.id ? { ...n, text: e.target.value } : n
                                        )
                                      )
                                    }
                                    placeholder="Ajouter une note pour cette étape (visible par le client)..."
                                    rows={2}
                                    className={cn(inputClass, "flex-1 text-sm min-h-[50px] resize-y")}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setProgressNotesDraft(
                                        progressNotesDraft.filter((n) => n.id !== note.id)
                                      )
                                    }
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-dzb-creamline text-dzb-faint transition hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                                    title="Supprimer cette note"
                                  >
                                    <TrashIcon className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="text-xs text-dzb-muted">Date/Heure :</label>
                                  <input
                                    type="datetime-local"
                                    value={note.at.slice(0, 16)}
                                    onChange={(e) =>
                                      setProgressNotesDraft(
                                        progressNotesDraft.map((n) =>
                                          n.id === note.id ? { ...n, at: new Date(e.target.value).toISOString() } : n
                                        )
                                      )
                                    }
                                    className={cn(inputClass, "w-auto min-w-[180px] text-sm")}
                                  />
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                setProgressNotesDraft([
                                  ...progressNotesDraft,
                                  {
                                    id: crypto.randomUUID(),
                                    status: entry.status,
                                    text: "",
                                    at: new Date().toISOString(),
                                  },
                                ])
                              }
                              className="flex items-center gap-1.5 text-sm text-dzb-amberink hover:text-dzb-amber font-medium"
                            >
                              <PlusIcon className="h-4 w-4" />
                              Ajouter une note
                            </button>
                          </div>
                        );
                      })()}
                    </li>
);
                })}
              </ul>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-dzb-creamline pt-4">
              <p className="text-xs">
                {savedFlash ? (
                  <span className="font-medium text-emerald-600">
                    Modifications enregistrées
                  </span>
                ) : hasUnsaved ? (
                  <span className="font-medium text-dzb-amberink">
                    Modifications non enregistrées
                  </span>
                ) : (
                  <span className="text-dzb-faint">Aucune modification</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {viewer && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setViewer(null)}
          >
            <img
              src={viewer}
              alt="Aperçu"
              className="max-h-full max-w-full rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </aside>
    </div>
  );
}
