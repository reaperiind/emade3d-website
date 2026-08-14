"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useI18n } from "@/i18n/provider";
import type { Order } from "@/lib/orders-store";
import { cn } from "@/lib/cn";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";

const inputClass =
  "w-full rounded-md border border-white/12 bg-ink-900 px-4 py-3 text-sm text-white placeholder:text-steel-500 transition focus:border-accent/60 focus:outline-none";

const SERVICE_MAP: Record<string, string> = {
  IMPRESSION_3D: "Impression 3D",
  CONCEPTION_3D: "Conception 3D",
  CONCEPTION_AND_IMPRESSION: "Conception + Impression 3D",
};

/**
 * In-house order tracking.
 *
 * On submit the code is looked up against GET /api/orders/:code (the site's
 * own API backed by Netlify Blobs) and the current status is displayed
 * directly on the page. A code can also be pre-filled via ?code=EMD-XXXXXX.
 */
export function TrackForm() {
  const { t } = useI18n();
  const track = t.track;
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState(false);
  const [initialCode, setInitialCode] = useState<string | null>(null);

  // Auto-search when landing with ?code=EMD-XXXXXX (e.g. from the order flow).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("code");
    if (c) {
      setCode(c);
      setInitialCode(c);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialCode) {
      runSearch(String(initialCode));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  async function runSearch(value: string) {
    const clean = value.trim().toUpperCase();
    if (!clean) return;
    setLoading(true);
    setError(false);
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(clean)}`);
      if (res.ok) {
        const json = (await res.json()) as { order?: Order };
        setOrder(json.order ?? null);
        if (!json.order) setError(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    runSearch(code);
  }

  function reset() {
    setOrder(null);
    setError(false);
    setCode("");
    const url = window.location.pathname + window.location.search;
    if (url.includes("code=")) {
      history.replaceState(null, "", window.location.pathname);
    }
  }

  const serviceLabel = order
    ? SERVICE_MAP[order.serviceType] ?? order.serviceType.replace(/_/g, " ")
    : "";

  if (order) {
    return (
      <div className="card rounded-xl border-white/10 p-6 sm:p-10">
        {/* Clear, prominent status for the customer */}
        <div className="relative rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/12 via-ink-800/40 to-ink-800 px-6 py-8 text-center sm:px-8">
          <button
            type="button"
            onClick={reset}
            aria-label={t.common.close}
            className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-steel-400 transition hover:text-white"
          >
            <CloseIcon className="h-4 w-4" />
          </button>

          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent ring-1 ring-accent/30">
            <CheckIcon className="h-9 w-9" />
          </span>

          <h2 className="h-display mt-4 text-2xl font-bold text-white sm:text-3xl">
            {track.statuses[order.status]}
          </h2>

          <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent-dim px-4 py-1.5 text-sm font-semibold text-accent">
            <span className="h-2 w-2 rounded-full bg-accent" />
            {track.statusLabel}
          </span>

          <p
            dir="ltr"
            className="mt-4 font-mono text-2xl font-extrabold tracking-widest text-white"
          >
            {order.code}
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          {[
            [track.client, `${order.firstName} ${order.lastName}`],
            [track.phone, order.phone],
            [track.service, serviceLabel],
            [track.date, order.orderDate ?? new Date(order.createdAt).toLocaleDateString()],
          ]
            .filter(([, v]) => v && v !== "—")
            .map(([label, value]) => (
              <div
                key={String(label)}
                className="flex items-start justify-between gap-4 rounded-lg border border-white/10 bg-ink-800 px-4 py-3"
              >
                <dt className="text-sm text-steel-400">{String(label)}</dt>
                <dd className="text-end text-sm font-semibold text-white">
                  {value}
                </dd>
              </div>
            ))}
        </div>

        {order.description && (
          <div className="mt-4 rounded-lg border border-white/10 bg-ink-800 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-widest text-steel-400">
              {track.description}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-steel-100">
              {order.description}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={reset}
          className="btn-outline btn-md mt-6 w-full"
        >
          {track.submit}
        </button>
      </div>
    );
  }

  return (
    <div className="card rounded-xl border-white/10 p-6 sm:p-10">
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="tf-code"
            className="mb-1.5 block text-sm font-medium text-steel-300"
          >
            {track.code} *
          </label>
          <input
            id="tf-code"
            name="code"
            type="text"
            dir="ltr"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            placeholder={track.codePlaceholder}
            className={cn(inputClass, "font-mono uppercase tracking-widest")}
          />
        </div>

        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-sm font-semibold text-red-300">
              {track.notFound}
            </p>
            <p className="mt-0.5 text-xs text-red-200/80">
              {track.notFoundCode}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary btn-md w-full disabled:opacity-60"
        >
          {loading ? track.sending : track.submit}
        </button>
        <p className="text-center text-xs leading-relaxed text-steel-500">
          {track.trackingHelp}
        </p>
      </form>
    </div>
  );
}