"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import type { Product } from "@/data/products";
import type { SiteSettings } from "@/lib/settings-store";
import { localized } from "@/lib/localize";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";
import { ArrowUpRightIcon } from "@/components/ui/icons";

const MEDIA_URL = (key: string) => `/api/media/${key}`;

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
                    <Link
                      href={`/${locale}/produits/${product.slug}`}
                      className={cn(
                        "btn-primary btn-sm",
                        !product.available && "pointer-events-none opacity-40"
                      )}
                    >
                      {pr.orderCta}
                      <ArrowUpRightIcon className="h-4 w-4 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
