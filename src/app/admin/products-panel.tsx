"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import type { LocalizedText } from "@/lib/localize";
import type { ProductOrder } from "@/lib/product-orders-store";
import { cn } from "@/lib/cn";
import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  WhatsAppIcon,
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

function waLink(order: ProductOrder): string {
  let phone = order.phone.replace(/[^\d]/g, "");
  if (phone.startsWith("0")) phone = "213" + phone.slice(1);
  const lines = [
    `Bonjour ${order.customerName},`,
    `${order.quantity} × ${productLabelFromOrder(order)}`,
    "Merci pour votre demande sur notre site Emade3D.",
  ];
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function productLabelFromOrder(order: ProductOrder): string {
  return order.productName.fr || order.productName.en || order.productName.ar || order.productSlug;
}

function deliveryLabel(order: ProductOrder): string {
  const d = order.delivery;
  if (!d || d.method === "pickup") return "Retrait sur place";
  if (d.option === "home") return `À domicile${d.address ? ` — ${d.address}` : ""}`;
  return `Bureau du coursier${d.wilayaId != null ? ` — wilaya ${d.wilayaId}` : ""}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-DZ", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function ProductsPanel({ token }: { token: string }) {
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<Product[] | null>(null);
  const [orders, setOrders] = useState<ProductOrder[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

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

  async function deleteOrder(id: string) {
    if (!window.confirm("Supprimer cette demande de produit ?")) return;
    try {
      const res = await fetch(`/api/product-orders?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOrders((prev) => (prev ?? []).filter((o) => o.id !== id));
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
              Gérez les produits affichés sur la page « Produits » et consultez
              les demandes d&apos;achat reçues via le formulaire de commande.
            </p>
          </div>
          <div className="flex gap-2">
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
          <div>
            <button
              type="button"
              onClick={() => setEditing(blankProduct())}
              className={secondaryButton}
            >
              <PlusIcon className="h-4 w-4" />
              Nouveau produit
            </button>
          </div>

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
        <ProductOrdersList orders={orders} onDelete={deleteOrder} />
      )}
    </div>
  );
}

function ProductOrdersList({
  orders,
  onDelete,
}: {
  orders: ProductOrder[] | null;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      {orders === null ? (
        <p className="py-10 text-center text-slate-400">Chargement…</p>
      ) : orders.length === 0 ? (
        <p className={cn(panelCard, "py-14 text-center text-slate-500")}>
          Aucune demande d&apos;achat pour le moment.
        </p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id} className={cn(panelCard, "p-4")}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">
                    {productLabelFromOrder(order)}
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      × {order.quantity}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {order.customerName} ·{" "}
                    <span dir="ltr">{order.phone}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {fmtDate(order.createdAt)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Livraison : {deliveryLabel(order)}
                    {order.delivery && order.delivery.method === "courier" ? (
                      <span className="ml-2 text-slate-400">
                        Frais : {order.delivery.fee ?? 0}
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <a
                    href={waLink(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Contacter
                  </a>
                  <button
                    type="button"
                    aria-label="Supprimer"
                    onClick={() => onDelete(order.id)}
                    className={dangerButton}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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