"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/data/products";
import type { LocalizedText } from "@/lib/localize";
import type {
  ProductOrder,
  ProductOrderStatus,
} from "@/lib/product-orders-store";
import { cn } from "@/lib/cn";
import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  WhatsAppIcon,
  SearchIcon,
  CloseIcon,
  PhoneIcon,
} from "@/components/ui/icons";
import {
  inputClass,
  labelClass,
  panelCard,
  panelHeading,
  panelMuted,
  saveButton,
  secondaryButton,
  dangerButton,
} from "./admin-types";

const MEDIA_URL = (key: string) => `/api/media/${key}`;

type LocalizedRecord = { fr: string; en: string; ar: string };

const EMPTY_LANG: LocalizedRecord = { fr: "", en: "", ar: "" };

const STATUS_FLOW: ProductOrderStatus[] = [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
];

const STATUS_META: Record<ProductOrderStatus, { label: string; pill: string }> = {
  NEW: {
    label: "Nouveau",
    pill: "border-orange-300 bg-orange-50 text-orange-700",
  },
  CONTACTED: {
    label: "Contacté",
    pill: "border-sky-300 bg-sky-50 text-sky-700",
  },
  CONFIRMED: {
    label: "Confirmé",
    pill: "border-violet-300 bg-violet-50 text-violet-700",
  },
  SHIPPED: {
    label: "Expédié",
    pill: "border-amber-300 bg-amber-50 text-amber-700",
  },
  DELIVERED: {
    label: "Livré",
    pill: "border-emerald-300 bg-emerald-50 text-emerald-700",
  },
  CANCELLED: {
    label: "Annulé",
    pill: "border-red-300 bg-red-50 text-red-600",
  },
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function blankProduct(): Product {
  return {
    slug: "",
    name: EMPTY_LANG,
    description: EMPTY_LANG,
    price: 0,
    available: true,
    images: [],
  };
}

function productName(p: Product): string {
  return p.name.fr || p.name.en || p.name.ar || p.slug;
}

function orderProductLabel(o: ProductOrder): string {
  return o.productName.fr || o.productName.en || o.productName.ar || o.productSlug;
}

function deliveryLabel(order: ProductOrder): string {
  const d = order.delivery;
  if (!d || d.method === "pickup") return "Retrait sur place";
  if (d.option === "home") return `À domicile${d.address ? ` — ${d.address}` : ""}`;
  return `Bureau du coursier${d.wilayaId != null ? ` — wilaya ${d.wilayaId}` : ""}`;
}

function orderTotal(o: ProductOrder): number {
  return (o.price || 0) * o.quantity + (o.delivery?.fee ?? 0);
}

function orderDeliveryType(o: ProductOrder): string {
  const d = o.delivery;
  if (!d || d.method === "pickup") return "pickup";
  return d.option === "home" ? "home" : "office";
}

function waPhone(o: ProductOrder): string {
  const digits = (o.phone ?? "").replace(/\D/g, "");
  if (digits.startsWith("213")) return digits;
  if (digits.startsWith("0")) return "213" + digits.slice(1);
  return digits;
}

function waLink(o: ProductOrder): string {
  const lines = [
    `Bonjour ${o.customerName},`,
    `${o.quantity} × ${orderProductLabel(o)}`,
    "Merci pour votre demande sur notre site Emade3D.",
  ];
  return `https://wa.me/${waPhone(o)}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-DZ", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function fmtMoney(n: number): string {
  return new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(n);
}

export function ProductsPanel({ token }: { token: string }) {
  const [tab, setTab] = useState<"products" | "orders">("orders");
  const [products, setProducts] = useState<Product[] | null>(null);
  const [orders, setOrders] = useState<ProductOrder[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [selected, setSelected] = useState<ProductOrder | null>(null);

  const bySlug = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products ?? []) map.set(p.slug, p);
    return map;
  }, [products]);

  const loadProducts = useCallback(() => {
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (Array.isArray(json?.products)) setProducts(json.products);
      })
      .catch(() => undefined);
  }, []);

  const loadOrders = useCallback(() => {
    fetch("/api/product-orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (Array.isArray(json?.orders)) setOrders(json.orders);
      })
      .catch(() => undefined);
  }, [token]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (tab === "orders") loadOrders();
  }, [tab, loadOrders]);

  async function persist(next: Product[]) {
    setSaving(true);
    setError(false);
    setSaved(false);
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ products: next }),
      });
      if (!res.ok) {
        setError(true);
        return false;
      }
      const json = await res.json();
      if (Array.isArray(json?.products)) setProducts(json.products);
      setSaved(true);
      return true;
    } catch {
      setError(true);
      return false;
    } finally {
      setSaving(false);
    }
  }

  function move(index: number, dir: -1 | 1) {
    if (!products) return;
    const target = index + dir;
    if (target < 0 || target >= products.length) return;
    const next = [...products];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    persist(next);
  }

  function removeProduct(product: Product) {
    if (!products) return;
    if (!window.confirm(`Supprimer le produit « ${productName(product)} » ?`)) return;
    persist(products.filter((p) => p.slug !== product.slug));
  }

  async function saveEdited() {
    if (!editing || !products) return;
    const frName = editing.name.fr ?? "";
    const slug = editing.slug.trim() || slugify(frName);
    if (!slug || !frName.trim()) {
      setError(true);
      return;
    }
    const clean: Product = { ...editing, slug };
    const exists = products.some((p) => p.slug === slug && p.slug !== editing.slug);
    if (exists) {
      setError(true);
      return;
    }
    const existing = products.find((p) => p.slug === editing.slug);
    const next = existing
      ? products.map((p) => (p.slug === existing.slug ? clean : p))
      : [...products, clean];
    setEditing(null);
    await persist(next);
  }

  const patchStatus = useCallback(
    async (id: string, status: ProductOrderStatus) => {
      const before = orders;
      setOrders((prev) =>
        (prev ?? []).map((o) =>
          o.id === id
            ? {
                ...o,
                status,
                history: [...(o.history ?? []), { status, at: new Date().toISOString() }],
              }
            : o
        )
      );
      try {
        const res = await fetch("/api/product-orders", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id, status }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.order) {
            setOrders((prev) =>
              (prev ?? []).map((o) => (o.id === id ? json.order : o))
            );
            setSelected((cur) => (cur?.id === id ? json.order : cur));
          }
          return;
        }
      } catch {
        /* ignore */
      }
      setOrders(before);
    },
    [orders, token]
  );

  async function deleteOrder(id: string) {
    if (!window.confirm("Supprimer cette demande de produit ?")) return;
    try {
      const res = await fetch(`/api/product-orders?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOrders((prev) => (prev ?? []).filter((o) => o.id !== id));
        setSelected(null);
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-6">
      <div className={panelCard}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={panelHeading}>Produits — Boutique</h2>
            <p className={panelMuted}>
              Gérez les produits affichés sur la page « Produits » et suivez les
              demandes d&apos;achat reçues, de l&apos;appel de confirmation à la livraison.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {tab === "products" && (
              <button
                type="button"
                onClick={() => setEditing(blankProduct())}
                className={secondaryButton}
              >
                <PlusIcon className="h-4 w-4" />
                Nouveau produit
              </button>
            )}
            <button
              type="button"
              onClick={() => setTab("products")}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition",
                tab === "products"
                  ? "bg-accent text-white"
                  : "border border-slate-300 bg-white text-slate-600"
              )}
            >
              Produits
            </button>
            <button
              type="button"
              onClick={() => setTab("orders")}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition",
                tab === "orders"
                  ? "bg-accent text-white"
                  : "border border-slate-300 bg-white text-slate-600"
              )}
            >
              Demandes d&apos;achat
              {orders && orders.length > 0 ? ` (${orders.length})` : ""}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            Erreur lors de l&apos;enregistrement.
          </p>
        )}
        {saved && (
          <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
            Enregistré.
          </p>
        )}
      </div>

      {tab === "products" && (
        <>
          {editing && (
            <ProductEditor
              product={editing}
              token={token}
              onCancel={() => setEditing(null)}
              onSave={saveEdited}
              onChange={setEditing}
              cancelDisabled={saving}
            />
          )}

          {products === null ? (
            <p className="py-10 text-center text-slate-400">Chargement…</p>
          ) : products.length === 0 ? (
            <p className={cn(panelCard, "py-14 text-center text-slate-500")}>
              Aucun produit. Cliquez sur « Nouveau produit » pour commencer.
            </p>
          ) : (
            <ul className="space-y-3">
              {products.map((product, index) => (
                <li
                  key={product.slug}
                  className={cn(panelCard, "flex items-center gap-4 p-4")}
                >
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      aria-label="Monter"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded border border-slate-300 text-slate-500 transition hover:border-accent hover:text-accent disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      aria-label="Descendre"
                      disabled={index === products.length - 1}
                      onClick={() => move(index, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded border border-slate-300 text-slate-500 transition hover:border-accent hover:text-accent disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>

                  <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    {product.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={MEDIA_URL(product.images[0])}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                        Sans image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">
                      {productName(product)}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-slate-500">
                      {product.price.toLocaleString("fr-DZ")} DA ·{" "}
                      {product.available ? "Disponible" : "Indisponible"}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-xs text-slate-400">
                      /{product.slug}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      aria-label="Modifier"
                      onClick={() =>
                        setEditing({
                          ...product,
                          images: [...(product.images ?? [])],
                        })
                      }
                      className={secondaryButton}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      aria-label="Supprimer"
                      onClick={() => removeProduct(product)}
                      className={dangerButton}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {tab === "orders" && (
        <ProductOrdersTable
          orders={orders}
          bySlug={bySlug}
          onChangeStatus={patchStatus}
          onDelete={deleteOrder}
          onSelect={setSelected}
        />
      )}

      {selected && (
        <OrderDetailOverlay
          order={selected}
          product={bySlug.get(selected.productSlug)}
          onClose={() => setSelected(null)}
          onChangeStatus={(s) => patchStatus(selected.id, s)}
          onDelete={() => deleteOrder(selected.id)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/*  Product orders          – table + status pipeline + timeline             */
/* ------------------------------------------------------------------------- */

function ProductOrdersTable({
  orders,
  bySlug,
  onChangeStatus,
  onDelete,
  onSelect,
}: {
  orders: ProductOrder[] | null;
  bySlug: Map<string, Product>;
  onChangeStatus: (id: string, status: ProductOrderStatus) => void;
  onDelete: (id: string) => void;
  onSelect: (o: ProductOrder) => void;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductOrderStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: 0 };
    for (const o of orders ?? []) {
      c.all++;
      c[o.status] = (c[o.status] ?? 0) + 1;
    }
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (orders ?? []).filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (typeFilter !== "all" && orderDeliveryType(o) !== typeFilter) return false;
      if (!q) return true;
      return (
        orderProductLabel(o).toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.phone ?? "").replace(/\s/g, "").includes(q.replace(/\s/g, ""))
      );
    });
  }, [orders, query, statusFilter, typeFilter]);

  return (
    <div className={panelCard}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher client, téléphone, produit…"
            className={cn(inputClass, "ps-9")}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={cn(inputClass, "w-auto")}
        >
          <option value="all">Tous les types</option>
          <option value="pickup">Retrait sur place</option>
          <option value="office">Bureau du coursier</option>
          <option value="home">À domicile</option>
        </select>
      </div>

      {/* Status pills */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(["all", ...STATUS_FLOW, "CANCELLED"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              statusFilter === s
                ? "border-accent bg-accent text-white"
                : s === "all"
                  ? "border-slate-300 bg-white text-slate-600 hover:border-accent"
                  : cn(
                      STATUS_META[s as ProductOrderStatus].pill,
                      "hover:opacity-80"
                    )
            )}
          >
            {s === "all" ? `Toutes (${counts.all ?? 0})` : `${STATUS_META[s as ProductOrderStatus].label} (${counts[s] ?? 0})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        {orders === null ? (
          <p className="py-12 text-center text-slate-400">Chargement…</p>
        ) : filtered.length === 0 ? (
          <p className="py-14 text-center text-slate-500">
            Aucune demande ne correspond aux filtres.
          </p>
        ) : (
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">
                <th className="px-3 py-2.5">Produit</th>
                <th className="px-3 py-2.5">Client</th>
                <th className="px-3 py-2.5 text-end">Qté × Prix</th>
                <th className="px-3 py-2.5 text-end">Total</th>
                <th className="hidden px-3 py-2.5 lg:table-cell">Livraison</th>
                <th className="px-3 py-2.5">Statut</th>
                <th className="hidden px-3 py-2.5 md:table-cell">Date</th>
                <th className="px-3 py-2.5 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const product = bySlug.get(o.productSlug);
                const cover = product?.images?.[0];
                const meta = STATUS_META[o.status] ?? STATUS_META.NEW;
                return (
                  <tr
                    key={o.id}
                    onClick={() => onSelect(o)}
                    className="group cursor-pointer border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                          {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={MEDIA_URL(cover)}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                              —
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[12rem] truncate font-medium text-slate-900">
                            {orderProductLabel(o)}
                          </p>
                          <p className="text-xs text-slate-400">
                            {o.productSlug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-slate-900">{o.customerName}</p>
                      <p className="text-xs text-slate-500" dir="ltr">
                        {o.phone}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-end tabular-nums text-slate-600">
                      {o.quantity} × {fmtMoney(o.price ?? 0)} DA
                    </td>
                    <td className="px-3 py-3 text-end font-semibold tabular-nums text-slate-900">
                      {fmtMoney(orderTotal(o))} DA
                    </td>
                    <td className="hidden px-3 py-3 lg:table-cell">
                      <p className="text-slate-600">{deliveryLabel(o)}</p>
                      <p className="text-xs text-slate-400">
                        Frais : {fmtMoney(o.delivery?.fee ?? 0)} DA
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                          meta.pill
                        )}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="hidden px-3 py-3 text-xs text-slate-500 md:table-cell">
                      {fmtDate(o.createdAt)}
                    </td>
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`tel:${o.phone}`}
                          title="Appeler le client"
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                        >
                          <PhoneIcon className="h-4 w-4" />
                        </a>
                        <a
                          href={waLink(o)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="WhatsApp"
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-300 hover:text-emerald-600"
                        >
                          <WhatsAppIcon className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          title="Supprimer"
                          onClick={() => onDelete(o.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:text-red-500"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/*  Order detail overlay — status pipeline, totals, timeline                 */
/* ------------------------------------------------------------------------- */

function OrderDetailOverlay({
  order,
  product,
  onClose,
  onChangeStatus,
  onDelete,
}: {
  order: ProductOrder;
  product?: Product;
  onClose: () => void;
  onChangeStatus: (s: ProductOrderStatus) => void;
  onDelete: () => void;
}) {
  const meta = STATUS_META[order.status] ?? STATUS_META.NEW;
  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const timeline = order.history ?? [];

  const cover = product?.images?.[0];
  const deliveries: [string, string][] = [
    ["Produit", orderProductLabel(order)],
    [
      "Qité",
      `${order.quantity} × ${fmtMoney(order.price ?? 0)} DA`,
    ],
    [
      "Sous-total",
      `${fmtMoney((order.price ?? 0) * order.quantity)} DA`,
    ],
    ["Frais de livraison", `${fmtMoney(order.delivery?.fee ?? 0)} DA`],
    [
      "Total",
      `${fmtMoney(orderTotal(order))} DA`,
    ],
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              {orderProductLabel(order)}
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">
              {order.customerName} ·{" "}
              <span dir="ltr">{order.phone}</span> · {fmtDate(order.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 text-slate-500 transition hover:border-slate-400 hover:text-slate-900"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Status pipeline */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center">
            {STATUS_FLOW.map((s, i) => {
              const reached = order.status === s || currentIdx > i;
              const isCancelled = order.status === "CANCELLED";
              const active = order.status === s;
              return (
                <div key={s} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center text-center">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition",
                        reached && !isCancelled
                          ? "border-emerald-400 bg-emerald-500 text-white"
                          : active && isCancelled
                            ? "border-red-400 bg-red-500 text-white"
                            : "border-slate-300 bg-white text-slate-400"
                      )}
                    >
                      {reached && !isCancelled ? <CheckIcon className="h-4 w-4" /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        "mt-1.5 hidden text-[10px] font-semibold sm:block",
                        active ? "text-slate-900" : "text-slate-400"
                      )}
                    >
                      {STATUS_META[s].label}
                    </span>
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div
                      className={cn(
                        "mx-1 h-0.5 flex-1 rounded",
                        reached && !isCancelled ? "bg-emerald-400" : "bg-slate-200"
                      )}
                    />
                  )}
                </div>
              );
            })}
            {/* Cancelled branch */}
            <div className="ms-1 flex items-center">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold",
                  order.status === "CANCELLED"
                    ? "border-red-400 bg-red-500 text-white"
                    : "border-slate-300 bg-white text-slate-400"
                )}
              >
                ✕
              </span>
              <span
                className={cn(
                  "mt-1.5 hidden text-[10px] font-semibold sm:block",
                  order.status === "CANCELLED" ? "text-red-600" : "text-slate-400"
                )}
              >
                Annulé
              </span>
            </div>
          </div>

          <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            Statut actuel :{" "}
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                meta.pill
              )}
            >
              {meta.label}
            </span>
          </p>

          {/* Status actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {STATUS_FLOW.map((s) => (
              <button
                key={s}
                type="button"
                disabled={s === order.status}
                onClick={() => onChangeStatus(s)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40",
                  s === order.status
                    ? "border-slate-300 bg-slate-100 text-slate-500"
                    : "border-slate-300 bg-white text-slate-600 hover:border-accent hover:text-accent"
                )}
              >
                {STATUS_META[s].label}
              </button>
            ))}
            <button
              type="button"
              disabled={order.status === "CANCELLED"}
              onClick={() => onChangeStatus("CANCELLED")}
              className={cn(
                "rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-40"
              )}
            >
              Annuler
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {/* Contact */}
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Contact
            </p>
            <p className="mt-2 font-medium text-slate-900">{order.customerName}</p>
            <p className="text-sm text-slate-500" dir="ltr">
              {order.phone}
            </p>
            <div className="mt-3 flex gap-2">
              <a
                href={`tel:${order.phone}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <PhoneIcon className="h-4 w-4" />
                Appeler
              </a>
              <a
                href={waLink(order)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
            {product && (
              <div className="mt-4 flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-md border border-slate-200">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={MEDIA_URL(cover)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                      —
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {productName(product)}
                  </p>
                  <p className="text-xs text-slate-400">/{product.slug}</p>
                </div>
              </div>
            )}
          </div>

          {/* Delivery */}
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Livraison
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {deliveryLabel(order)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Frais : {fmtMoney(order.delivery?.fee ?? 0)} DA
            </p>
            {order.delivery?.wilayaId != null && (
              <p className="mt-1 text-sm text-slate-500">
                Wilaya {order.delivery.wilayaId}
              </p>
            )}
            {order.delivery?.address && (
              <p className="mt-1 text-sm text-slate-500">
                {order.delivery.address}
              </p>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <tbody>
              {deliveries.map(([label, value]) => (
                <tr key={label} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2.5 text-slate-500">{label}</td>
                  <td
                    className={cn(
                      "px-4 py-2.5 text-end tabular-nums",
                      label === "Total"
                        ? "font-bold text-slate-900"
                        : "text-slate-700"
                    )}
                  >
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Timeline */}
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Historique
          </p>
          <ol className="mt-3 space-y-3">
            {timeline.map((h, i) => (
              <li key={`${h.at}-${i}`} className="flex items-start gap-3">
                <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-accent" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {STATUS_META[h.status]?.label ?? h.status}
                  </p>
                  <p className="text-xs text-slate-400">{fmtDate(h.at)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onDelete}
            className={dangerButton}
          >
            <TrashIcon className="h-4 w-4" />
            Supprimer la demande
          </button>
          <button type="button" onClick={onClose} className={secondaryButton}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/*  Product editor                                                           */
/* ------------------------------------------------------------------------- */

function ProductEditor({
  product,
  token,
  onChange,
  onSave,
  onCancel,
  cancelDisabled,
}: {
  product: Product;
  token: string;
  onChange: (p: Product) => void;
  onSave: () => void;
  onCancel: () => void;
  cancelDisabled: boolean;
}) {
  return (
    <div className={panelCard}>
      <h2 className={panelHeading}>
        {productName(product) ? `Modifier : ${productName(product)}` : "Nouveau produit"}
      </h2>

      <LangTextField
        label="Nom (FR, EN, AR)"
        value={product.name as LocalizedRecord}
        onChange={(name) => onChange({ ...product, name: name as LocalizedText })}
      />

      <LangTextField
        label="Description (FR, EN, AR)"
        value={product.description as LocalizedRecord}
        onChange={(description) =>
          onChange({ ...product, description: description as LocalizedText })
        }
        textarea
      />

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {product.slug && (
          <div>
            <label className={labelClass}>Lien (slug)</label>
            <input
              value={product.slug}
              onChange={(e) => onChange({ ...product, slug: e.target.value })}
              dir="ltr"
              placeholder={slugify(product.name.fr ?? "") || "mon-produit"}
              className={cn(inputClass, "font-mono text-xs")}
            />
          </div>
        )}
        <div>
          <label className={labelClass}>Prix (DA)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={product.price}
            onChange={(e) =>
              onChange({ ...product, price: Number(e.target.value) })
            }
            dir="ltr"
            className={cn(inputClass, "font-mono text-xs")}
          />
        </div>
        <div className="flex items-end">
          <label className={cn(labelClass, "flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700")}>
            <input
              type="checkbox"
              checked={product.available}
              onChange={(e) =>
                onChange({ ...product, available: e.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
            />
            Disponible à la vente
          </label>
        </div>
      </div>

      <ProductImageManager product={product} token={token} onChange={onChange} />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={cancelDisabled}
          className={secondaryButton}
        >
          Annuler
        </button>
        <button type="button" onClick={onSave} disabled={cancelDisabled} className={saveButton}>
          <CheckIcon className="h-4 w-4" />
          Enregistrer le produit
        </button>
      </div>
    </div>
  );
}

function LangTextField({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: LocalizedRecord;
  onChange: (v: LocalizedRecord) => void;
  textarea?: boolean;
}) {
  return (
    <div className="mt-3">
      <label className={labelClass}>{label}</label>
      <div className="grid gap-2 sm:grid-cols-3">
        <LangInput lang="fr" value={value.fr} onChange={(v) => onChange({ ...value, fr: v })} textarea={textarea} />
        <LangInput lang="en" value={value.en} onChange={(v) => onChange({ ...value, en: v })} dir="ltr" textarea={textarea} />
        <LangInput lang="ar" value={value.ar} onChange={(v) => onChange({ ...value, ar: v })} dir="rtl" textarea={textarea} />
      </div>
    </div>
  );
}

function LangInput({
  lang,
  value,
  onChange,
  dir,
  textarea,
}: {
  lang: string;
  value: string;
  onChange: (v: string) => void;
  dir?: string;
  textarea?: boolean;
}) {
  if (textarea) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={dir}
        rows={3}
        placeholder={lang}
        className={inputClass}
      />
    );
  }
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      dir={dir}
      placeholder={lang}
      className={inputClass}
    />
  );
}

function ProductImageManager({
  product,
  token,
  onChange,
}: {
  product: Product;
  token: string;
  onChange: (p: Product) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const images = product.images ?? [];

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      for (const file of Array.from(files)) fd.append("file", file);
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        keys?: string[];
        error?: string;
      } | null;
      if (res.ok && json?.ok && json.keys) {
        onChange({ ...product, images: [...images, ...json.keys] });
      } else {
        const reason =
          res.status === 401
            ? "Non autorisé : reconnectez-vous."
            : res.status === 413
              ? "Image(s) trop lourde(s)."
              : `Échec de l'upload (statut ${res.status}).`;
        setUploadError(reason);
      }
    } catch (err) {
      setUploadError(
        `Erreur réseau : ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removeImage(key: string) {
    onChange({ ...product, images: images.filter((k) => k !== key) });
    try {
      await fetch(`/api/media/${encodeURIComponent(key)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
      <p className="text-sm font-medium text-slate-700">Images du produit</p>
      <p className="mt-0.5 text-xs text-slate-500">
        La première image sert d&apos;image principale sur la fiche produit.
      </p>
      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {images.map((key, i) => (
            <div
              key={key}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-300 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={MEDIA_URL(key)} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute start-1 top-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                  Principale
                </span>
              )}
              <button
                type="button"
                aria-label="Supprimer l'image"
                onClick={() => removeImage(key)}
                className="absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded bg-red-500/90 text-white opacity-0 transition group-hover:opacity-100"
              >
                <TrashIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => onFiles(e.target.files)}
        className="sr-only"
        id="product-files"
        style={{ position: "absolute", width: "1px", height: "1px" }}
      />
      {uploadError && (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {uploadError}
        </p>
      )}
      <label
        htmlFor="product-files"
        className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-accent hover:text-accent"
      >
        <PlusIcon className="h-4 w-4" />
        {uploading ? "Chargement…" : "Ajouter des images"}
      </label>
    </div>
  );
}