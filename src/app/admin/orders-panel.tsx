"use client";

import { useCallback, useEffect, useState } from "react";
import type { Order, OrderStatus } from "@/lib/orders-store";
import { statusesFor } from "@/lib/order-flows";
import { cn } from "@/lib/cn";
import { localizePath } from "@/i18n/config";
import {
  TrashIcon,
  WhatsAppIcon,
  DownloadIcon,
} from "@/components/ui/icons";
import {
  inputClass,
  panelCard,
  panelHeading,
  panelMuted,
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
  SUBMITTED: "border-accent/40 bg-orange-50 text-accent",
  UNDER_REVIEW: "border-sky-300 bg-sky-50 text-sky-700",
  QUOTE_SENT: "border-amber-300 bg-amber-50 text-amber-700",
  CONFIRMED: "border-emerald-300 bg-emerald-50 text-emerald-700",
  IN_PRODUCTION: "border-violet-300 bg-violet-50 text-violet-700",
  IN_DESIGN: "border-violet-300 bg-violet-50 text-violet-700",
  DESIGN_APPROVAL: "border-amber-300 bg-amber-50 text-amber-700",
  QUALITY_CHECK: "border-sky-300 bg-sky-50 text-sky-700",
  READY: "border-emerald-300 bg-emerald-50 text-emerald-700",
  DELIVERED: "border-emerald-300 bg-emerald-50 text-emerald-700",
  CLOSED: "border-slate-300 bg-slate-100 text-slate-600",
  new: "border-accent/40 bg-orange-50 text-accent",
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

export function OrdersPanel({
  orders,
  loading,
  token,
  onStatus,
  onPrice,
  onDeliveryFee,
  onHistoryAt,
  onDelete,
  onFilesChange,
}: {
  orders: Order[];
  loading: boolean;
  token: string;
  onStatus: (code: string, status: OrderStatus) => void;
  onPrice: (code: string, raw: string) => void;
  onDeliveryFee: (code: string, raw: string) => void;
  onHistoryAt: (code: string, index: number, value: string) => void;
  onDelete: (code: string) => void;
  onFilesChange: (code: string, files: Order["files"]) => void;
}) {
  return (
    <div className="space-y-6">
      {loading ? (
        <p className="py-10 text-center text-slate-400">Chargement…</p>
      ) : orders.length === 0 ? (
        <p
          className={cn(panelCard, "py-14 text-center text-slate-500")}
        >
          Aucune commande pour le moment.
        </p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.code}
              order={order}
              token={token}
              onStatus={onStatus}
              onPrice={onPrice}
              onDeliveryFee={onDeliveryFee}
              onHistoryAt={onHistoryAt}
              onDelete={onDelete}
              onFilesChange={onFilesChange}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderCard({
  order,
  token,
  onStatus,
  onPrice,
  onDeliveryFee,
  onHistoryAt,
  onDelete,
  onFilesChange,
}: {
  order: Order;
  token: string;
  onStatus: (code: string, status: OrderStatus) => void;
  onPrice: (code: string, raw: string) => void;
  onDeliveryFee: (code: string, raw: string) => void;
  onHistoryAt: (code: string, index: number, value: string) => void;
  onDelete: (code: string) => void;
  onFilesChange: (code: string, files: Order["files"]) => void;
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
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [viewer, setViewer] = useState<string | null>(null);
  const waPhoneNumber = waPhone(order);

  const imageFiles = (order.files ?? []).filter((f) => IMAGE_EXT_RE.test(f.name));

  // Load thumbnails for attached images (fetch requires the admin token).
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
    <li className={panelCard}>
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
                  "border-slate-300 bg-slate-100 text-slate-600"
              )}
            >
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-slate-900">
            {order.firstName} {order.lastName} ·{" "}
            <span dir="ltr">{order.phone}</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {new Date(order.createdAt).toLocaleString("fr-FR")} ·{" "}
            {order.serviceType.replace(/_/g, " ")}
            {order.orderDate ? ` · ${order.orderDate}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={order.status}
            onChange={(e) => onStatus(order.code, e.target.value as OrderStatus)}
            className={cn(
              inputClass,
              "w-44 appearance-none py-1.5"
            )}
          >
            {options.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s] ?? s}
              </option>
            ))}
          </select>
          {waPhoneNumber && (
            <div className="flex items-center gap-1 rounded-md border border-green-200 p-0.5">
              <a
                href={waLink(order, "ar")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-7 items-center px-2 text-xs font-semibold text-green-700 transition hover:bg-green-50"
                title="Envoyer en arabe"
              >
                عربي
              </a>
              <a
                href={waLink(order, "fr")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-7 items-center px-2 text-xs font-semibold text-green-700 transition hover:bg-green-50"
                title="Envoyer en français"
              >
                FR
              </a>
            </div>
          )}
          <button
            type="button"
            aria-label={`Supprimer ${order.code}`}
            onClick={() => onDelete(order.code)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 transition hover:border-red-300 hover:text-red-500"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Price + delivery fee */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Prix (visible du client dès « Devis envoyé »)
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
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Frais de livraison
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
          <p className="flex items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
            Retrait sur place — gratuit
          </p>
        )}
      </div>

      {/* Delivery summary */}
      {order.delivery && (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
          Livraison :{" "}
          {order.delivery.method === "courier"
            ? order.delivery.option === "home"
              ? `À domicile${order.delivery.address ? ` — ${order.delivery.address}` : ""}${order.delivery.communeName ? ` / ${order.delivery.communeName}` : ""}`
              : `Bureau du coursier — ${order.delivery.wilayaId ?? order.delivery.officeId ?? "—"}`
            : "Retrait sur place"}
        </p>
      )}

      {order.description && (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5 text-sm leading-relaxed text-slate-700">
          {order.description}
        </p>
      )}

      {/* Attached design files */}
      {order.files && order.files.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
            Fichiers du projet
          </p>
          <ul className="mt-2 space-y-2">
            {order.files.map((file) => (
              <li
                key={file.key}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {IMAGE_EXT_RE.test(file.name) &&
                    (previews[file.key] ? (
                      <button
                        type="button"
                        onClick={() => setViewer(previews[file.key])}
                        className="shrink-0 overflow-hidden rounded-md border border-slate-200 transition hover:opacity-80"
                      >
                        <img
                          src={previews[file.key]}
                          alt={file.name}
                          className="h-12 w-12 object-cover"
                        />
                      </button>
                    ) : (
                      <span className="h-12 w-12 shrink-0 animate-pulse rounded-md border border-slate-200 bg-slate-200" />
                    ))}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => downloadFile(file.key)}
                    className="flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition hover:border-accent hover:text-accent"
                  >
                    <DownloadIcon className="h-3.5 w-3.5" />
                    Télécharger
                  </button>
                  <button
                    type="button"
                    aria-label={`Supprimer ${file.name}`}
                    onClick={() => deleteFile(file.key)}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-400 transition hover:border-red-300 hover:text-red-500"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* History (editable timestamps) */}
      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
          Historique (date &amp; heure)
        </p>
        <ul className="mt-2 space-y-2">
          {order.history.map((entry, index) => (
            <li
              key={`${entry.status}-${index}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <span className="text-sm font-medium text-slate-800">
                {STATUS_LABELS[entry.status] ?? entry.status}
              </span>
              <input
                type="datetime-local"
                value={toLocalInput(entry.at)}
                onChange={(e) => onHistoryAt(order.code, index, e.target.value)}
                className={cn(inputClass, "py-1")}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Save changes */}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <p className="text-xs">
          {savedFlash ? (
            <span className="text-emerald-600">
              Modifications enregistrées ✓
            </span>
          ) : hasUnsaved ? (
            <span className="text-amber-600">Modifications non enregistrées</span>
          ) : (
            <span className="text-slate-400">Aucune modification</span>
          )}
        </p>
        <button
          type="button"
          onClick={saveOrder}
          disabled={!hasUnsaved}
          className={cn(saveButton, "disabled:opacity-50")}
        >
          Enregistrer
        </button>
      </div>

      {/* Image viewer */}
      {viewer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setViewer(null)}
        >
          <img
            src={viewer}
            alt="Aperçu"
            className="max-h-full max-w-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </li>
  );
}