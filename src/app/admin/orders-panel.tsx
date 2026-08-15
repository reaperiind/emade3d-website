"use client";

import { useCallback, useState } from "react";
import type { Order, OrderStatus } from "@/lib/orders-store";
import { statusesFor } from "@/lib/order-flows";
import { cn } from "@/lib/cn";
import { TrashIcon } from "@/components/ui/icons";
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
  onStatus,
  onPrice,
  onDeliveryFee,
  onHistoryAt,
  onDelete,
}: {
  orders: Order[];
  loading: boolean;
  onStatus: (code: string, status: OrderStatus) => void;
  onPrice: (code: string, raw: string) => void;
  onDeliveryFee: (code: string, raw: string) => void;
  onHistoryAt: (code: string, index: number, value: string) => void;
  onDelete: (code: string) => void;
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
    </li>
  );
}