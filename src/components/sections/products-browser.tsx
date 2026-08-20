"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useI18n } from "@/i18n/provider";
import type { Product } from "@/data/products";
import type { SiteSettings } from "@/lib/settings-store";
import { localized } from "@/lib/localize";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";
import {
  CheckIcon,
  CloseIcon,
  ArrowUpRightIcon,
} from "@/components/ui/icons";

const MEDIA_URL = (key: string) => `/api/media/${key}`;

const inputClass =
  "w-full rounded-md border border-white/12 bg-ink-900 px-4 py-3 text-sm text-white placeholder:text-steel-500 transition focus:border-accent/60 focus:outline-none";

function Price({ amount, currency }: { amount: number; currency: string }) {
  return (
    <span className="font-display text-lg font-bold text-accent">
      {new Intl.NumberFormat("fr-DZ", {
        maximumFractionDigits: 0,
      }).format(amount)}{" "}
      {currency || "DA"}
    </span>
  );
}

export function ProductsBrowser() {
  const { locale, t } = useI18n();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [buying, setBuying] = useState<Product | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && Array.isArray(json?.products)) {
          setProducts(json.products);
        }
      })
      .catch(() => undefined);
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.settings) setSettings(json.settings);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const currency = settings?.currency ?? "DA";
  const pr = t.products;

  return (
    <div>
      {products === null ? (
        <p className="text-muted mt-16 text-center">{pr.loading}</p>
      ) : products.length === 0 ? (
        <p className="text-muted mt-16 text-center">{pr.empty}</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <Reveal key={product.slug} delay={(i % 3) * 70}>
              <div className="card group block overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card-lg">
                <div className="relative overflow-hidden">
                  {product.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={MEDIA_URL(product.images[0])}
                      alt={localized(product.name, locale)}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] w-full items-center justify-center bg-ink-800/60 text-sm text-steel-500">
                      {pr.noImage}
                    </div>
                  )}
                  <span
                    className={cn(
                      "absolute end-4 top-4 rounded-full px-3 py-1 text-xs font-bold backdrop-blur",
                      product.available
                        ? "bg-emerald-500/90 text-ink-950"
                        : "bg-steel-600/90 text-white"
                    )}
                  >
                    {product.available ? pr.available : pr.unavailable}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="font-display text-lg font-semibold text-white">
                    {localized(product.name, locale)}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-steel-400">
                    {localized(product.description, locale)}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <Price amount={product.price} currency={currency} />
                    <button
                      type="button"
                      disabled={!product.available}
                      onClick={() => setBuying(product)}
                      className={cn(
                        "btn-primary btn-sm",
                        !product.available && "pointer-events-none opacity-40"
                      )}
                    >
                      {pr.orderCta}
                      <ArrowUpRightIcon className="h-4 w-4 rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {buying && (
        <PurchaseForm
          product={buying}
          currency={currency}
          onClose={() => setBuying(null)}
        />
      )}
    </div>
  );
}

function PurchaseForm({
  product,
  currency,
  onClose,
}: {
  product: Product;
  currency: string;
  onClose: () => void;
}) {
  const { locale, t } = useI18n();
  const pr = t.products;
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/product-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          productName: product.name,
          customerName: String(fd.get("name") ?? "").trim(),
          phone: String(fd.get("phone") ?? "").trim(),
          quantity: Number(fd.get("quantity") ?? 1),
          notes: String(fd.get("notes") ?? "").trim(),
          locale,
        }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        setError(pr.error);
      }
    } catch {
      setError(pr.error);
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card-mode relative max-h-[90vh] w-full max-w-md overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
          className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-white transition hover:border-white/30"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        {sent ? (
          <div className="px-6 py-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <CheckIcon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-display text-xl font-bold text-white">
              {pr.successTitle}
            </h3>
            <p className="text-muted mt-2 text-sm leading-relaxed">
              {pr.successText}
            </p>
            <button type="button" onClick={onClose} className="btn-primary btn-md mt-6">
              {t.common.close}
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="p-6">
            <h3 className="font-display text-xl font-bold text-white">
              {pr.formTitle}
            </h3>
            <div className="mt-3 rounded-lg border border-white/10 bg-ink-800/60 p-4">
              <p className="font-semibold text-white">
                {localized(product.name, locale)}
              </p>
              <p className="mt-1 text-sm text-steel-400">
                <Price amount={product.price} currency={currency} /> · x{" "}
                {pr.quantity}
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-steel-400">
                  {pr.name}
                </label>
                <input
                  name="name"
                  required
                  placeholder={pr.namePlaceholder}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-steel-400">
                  {pr.phone}
                </label>
                <input
                  name="phone"
                  required
                  type="tel"
                  dir="ltr"
                  placeholder={pr.phonePlaceholder}
                  className={cn(inputClass, "text-start")}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-steel-400">
                  {pr.quantity}
                </label>
                <input
                  name="quantity"
                  type="number"
                  min={1}
                  defaultValue={1}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-steel-400">
                  {pr.notes}
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder={pr.notesPlaceholder}
                  className={inputClass}
                />
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="btn-primary btn-md mt-6 w-full justify-center"
            >
              {sending ? pr.sending : pr.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}