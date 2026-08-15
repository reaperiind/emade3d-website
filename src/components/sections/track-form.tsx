"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useI18n } from "@/i18n/provider";
import type { Order } from "@/lib/orders-store";
import { cn } from "@/lib/cn";
import {
  CheckIcon,
  CloseIcon,
  MapPinIcon,
  BoxIcon,
  ClockIcon,
} from "@/components/ui/icons";

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
 * directly on the page. When the admin has set a price it is shown, along
 * with the delivery information and the full step-by-step history (with date
 * and time). A code can also be pre-filled via ?code=EMD-XXXXXX.
 */
export function TrackForm() {
  const { locale, t } = useI18n();
  const track = t.track;
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState(false);
  const [initialCode, setInitialCode] = useState<string | null>(null);
  const [offices, setOffices] = useState<
    { id: string; name: string; address: string }[]
  >([]);
  const [pickupNote, setPickupNote] = useState("");

  // Load the courier offices + pickup note so the tracking page can show the
  // delivery office name/address and the pickup location details.
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const list = json?.settings?.delivery?.offices;
        if (Array.isArray(list)) setOffices(list);
        const note = json?.settings?.delivery?.pickupNote;
        if (typeof note === "string") setPickupNote(note);
      })
      .catch(() => undefined);
  }, []);

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

  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ" : locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale]
  );

  const serviceLabel = order
    ? SERVICE_MAP[order.serviceType] ?? order.serviceType.replace(/_/g, " ")
    : "";

  if (order) {
    const delivery = order.delivery;
    const deliveryFee = delivery?.fee ?? 0;
    const price = order.price;
    const showPrice = typeof price === "number" && Number.isFinite(price);
    const isCourier = delivery?.method === "courier";
    const office =
      isCourier && delivery?.option === "office"
        ? offices.find((o) => o.id === delivery.officeId)
        : undefined;

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

        {/* Price + delivery */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-accent/25 bg-accent-dim px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent">
                {isCourier ? (
                  <BoxIcon className="h-4 w-4" />
                ) : (
                  <MapPinIcon className="h-4 w-4" />
                )}
              </span>
              <span className="text-sm text-steel-300">{track.price}</span>
            </div>
            <span className="text-end text-sm font-bold text-white">
              {showPrice
                ? `${price} ${order.currency ?? ""}`
                : track.pricePending}
            </span>
          </div>

          <div className="rounded-xl border border-white/10 bg-ink-800 px-4 py-3.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <MapPinIcon className="h-4 w-4 text-steel-400" />
                <span className="text-sm text-steel-300">{track.delivery}</span>
              </div>
              <span className="text-end text-sm font-semibold text-white">
                {!delivery
                  ? track.deliveryPickup
                  : delivery.method === "pickup"
                    ? track.deliveryPickup
                    : delivery.option === "home"
                      ? track.deliveryHome
                      : track.deliveryOffice}
              </span>
            </div>

            {(!delivery || delivery.method === "pickup") && pickupNote && (
              <p className="mt-2 text-sm leading-relaxed text-steel-200">
                {pickupNote}
              </p>
            )}

            {isCourier && delivery.option === "home" && delivery.address && (
              <p className="mt-2 text-sm leading-relaxed text-steel-200">
                {delivery.address}
              </p>
            )}

            {isCourier && delivery.option === "office" && (
              <div className="mt-2 space-y-1">
                <p className="text-sm font-semibold text-white">
                  {office?.name ?? track.deliveryOfficeName}
                </p>
                {office?.address && (
                  <p className="text-sm leading-relaxed text-steel-200">
                    {office.address}
                  </p>
                )}
              </div>
            )}

            {isCourier && (
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                <span className="text-steel-400">{track.deliveryFee}</span>
                <span className="font-semibold text-white">
                  {deliveryFee} {order.currency ?? ""}
                </span>
              </div>
            )}

            {showPrice && isCourier && (
              <div className="flex items-center justify-between border-t border-accent/25 pt-3 text-sm">
                <span className="font-semibold text-steel-200">{track.total}</span>
                <span className="font-bold text-accent">
                  {(price ?? 0) + deliveryFee} {order.currency ?? ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* History timeline */}
        <div className="mt-6">
          <h3 className="font-display text-lg font-semibold text-white">
            {track.historyTitle}
          </h3>
          <p className="text-muted mt-0.5 text-sm">{track.historySubtitle}</p>
          <ol className="mt-4 space-y-0">
            {order.history.map((entry, index) => {
              const isCurrent = index === order.history.length - 1;
              const isLast = index === order.history.length - 1;
              return (
                <li key={`${entry.status}-${index}`} className="relative flex gap-3.5 pb-6 last:pb-0">
                  {/* line */}
                  {!isLast && (
                    <span
                      aria-hidden
                      className="absolute start-[7px] top-5 h-full w-px bg-white/10"
                    />
                  )}
                  {/* dot */}
                  <span
                    className={cn(
                      "mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                      isCurrent
                        ? "border-accent bg-accent/20"
                        : "border-white/20 bg-ink-800"
                    )}
                  >
                    {isCurrent && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          isCurrent ? "text-accent" : "text-white"
                        )}
                      >
                        {track.statuses[entry.status]}
                      </p>
                      <p
                        dir="ltr"
                        className="flex items-center gap-1.5 text-xs text-steel-400"
                      >
                        <ClockIcon className="h-3.5 w-3.5" />
                        {dateFmt.format(new Date(entry.at))}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

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