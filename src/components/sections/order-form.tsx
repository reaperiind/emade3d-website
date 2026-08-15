"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { localizePath } from "@/i18n/config";
import { downloadOrderReceipt } from "@/lib/receipt";
import type { Order } from "@/lib/orders-store";
import type { CourierOption, DeliveryMethod } from "@/lib/order-flows";
import type { SiteSettings } from "@/lib/settings-store";
import { cn } from "@/lib/cn";
import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  ArrowUpRightIcon,
  PlusIcon,
  MapPinIcon,
  BoxIcon,
} from "@/components/ui/icons";

const inputClass =
  "w-full rounded-md border border-white/12 bg-ink-900 px-4 py-3 text-sm text-white placeholder:text-steel-500 transition focus:border-accent/60 focus:outline-none";

const SERVICE_MAP: Record<string, string> = {
  IMPRESSION_3D: "Impression 3D",
  CONCEPTION_3D: "Conception 3D",
  CONCEPTION_AND_IMPRESSION: "Conception + Impression 3D",
};

/**
 * Order form backed by the site's own API.
 *
 * A delivery method is chosen (pickup / courier office / courier home) and the
 * delivery fee is shown live: office (stop-desk) delivery uses the selected
 * wilaya's stop-desk fee; home delivery uses the destination wilaya's home fee
 * (falling back to the global home fee). On confirm the order is sent to
 * POST /api/orders, which stores it and returns the tracking code.
 */
export function OrderForm() {
  const { locale, t } = useI18n();
  const q = t.quote;
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<Order | null>(null);
  const [receiptSaved, setReceiptSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const [deliverySettings, setDeliverySettings] = useState<SiteSettings | null>(
    null
  );
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup");
  const [courierOption, setCourierOption] = useState<CourierOption>("office");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [wilayaId, setWilayaId] = useState<number | null>(null);

  // Load settings (wilayas, currency, delivery data).
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const settings = json?.settings as SiteSettings | undefined;
        if (settings) setDeliverySettings(settings);
      })
      .catch(() => undefined);
  }, []);

  const hasDeliveryData = Boolean(deliverySettings?.delivery.wilayas?.length);
  const currency = deliverySettings?.currency ?? "DA";
  const homeFeeFallback = deliverySettings?.delivery.homeFee ?? 0;

  const wilayas = useMemo(
    () => deliverySettings?.delivery.wilayas ?? [],
    [deliverySettings]
  );

  const displayedFee = useMemo(() => {
    if (deliveryMethod === "pickup") return { fee: 0, loading: false };
    const wilaya =
      wilayaId == null
        ? undefined
        : wilayas.find((w) => w.id === wilayaId);
    if (courierOption === "office") {
      // Stop-desk (office pickup) price for the selected wilaya.
      const fee = wilaya?.stopDeskFee ?? homeFeeFallback;
      return { fee, loading: false };
    }
    // Home delivery: per-wilaya fee, falling back to the global home fee.
    const fee = wilaya?.homeFee ?? homeFeeFallback;
    return { fee, loading: false };
  }, [deliveryMethod, courierOption, wilayaId, wilayas, homeFeeFallback]);

  function buildDeliveryPayload() {
    if (deliveryMethod === "pickup") return { method: "pickup" as const };
    return {
      method: "courier" as const,
      option: courierOption,
      ...(hasDeliveryData && wilayaId != null ? { wilayaId } : {}),
      ...(courierOption === "home" ? { address: deliveryAddress } : {}),
    };
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;

    const form = e.currentTarget;
    const data = new FormData(form);
    const value = (name: string) => String(data.get(name) ?? "").trim();

    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: value("firstName"),
          lastName: value("lastName"),
          phone: value("phone"),
          orderDate: value("orderDate"),
          serviceType: value("serviceType"),
          description: value("description"),
          locale,
          delivery: buildDeliveryPayload(),
        }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; code?: string; error?: string }
        | null;
      if (!res.ok || !json?.code) {
        setError(json?.error ?? "unknown");
        setSending(false);
        return;
      }
      const now = new Date().toISOString();
      setSent({
        code: json.code,
        createdAt: now,
        status: "SUBMITTED",
        history: [{ status: "SUBMITTED", at: now }],
        firstName: value("firstName"),
        lastName: value("lastName"),
        phone: value("phone"),
        orderDate: value("orderDate"),
        serviceType: value("serviceType"),
        description: value("description"),
        locale,
        delivery: buildDeliveryPayload(),
      });
      setSending(false);
    } catch {
      setError("network");
      setSending(false);
    }
  }

  function onSaveReceipt() {
    if (!sent) return;
    downloadOrderReceipt(sent, "Emade3D");
    setReceiptSaved(true);
  }

  async function onCopy() {
    if (!sent) return;
    try {
      await navigator.clipboard.writeText(sent.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }

  const feeDisplay = displayedFee.loading
    ? q.deliveryPriceLoading
    : displayedFee.fee == null
      ? "—"
      : displayedFee.fee === 0
        ? q.deliveryFree
        : `${displayedFee.fee} ${currency}`;

  const serviceLabel = sent
    ? SERVICE_MAP[sent.serviceType] ?? sent.serviceType
    : "";

  if (sent) {
    return (
      <div className="card rounded-xl border-white/10 p-6 sm:p-10">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
            <CheckIcon className="h-6 w-6" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">
              {q.result.successTitle}
            </h2>
            <p className="text-muted mt-1 text-sm leading-relaxed">
              {q.result.successText}
            </p>
          </div>
        </div>

        {/* Tracking code */}
        <div className="mt-6 rounded-xl border border-accent/30 bg-accent-dim p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-steel-400">
            {q.result.codeLabel}
          </p>
          <p
            dir="ltr"
            className="mt-2 font-mono text-4xl font-extrabold tracking-wider text-white"
          >
            {sent.code}
          </p>
          <div className="mt-4 inline-flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={onCopy}
              className="btn-outline-accent btn-sm"
            >
              <CopyIcon className="h-4 w-4" />
              {copied ? q.result.copied : q.result.copyCode}
            </button>
            <Link
              href={`${localizePath("/suivre-ma-commande", locale)}?code=${encodeURIComponent(sent.code)}`}
              className="btn-outline btn-sm"
            >
              <ArrowUpRightIcon className="h-4 w-4" />
              {q.result.goToTracking}
            </Link>
          </div>
        </div>

        {/* Receipt summary */}
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            [q.lastName, `${sent.firstName} ${sent.lastName}`],
            [q.phone, sent.phone],
            [q.serviceType, serviceLabel],
            [q.orderDate, sent.orderDate ?? "—"],
            [
              q.delivery,
              sent.delivery?.method === "courier"
                ? sent.delivery.option === "home"
                  ? q.deliveryHome
                  : q.deliveryOffice
                : q.deliveryPickup,
            ],
          ]
            .filter(([, value]) => value !== "—" && value)
            .map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-lg border border-white/10 bg-ink-800 px-4 py-3"
              >
                <dt className="text-xs font-medium text-steel-400">
                  {String(label)}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-white">
                  {value}
                </dd>
              </div>
            ))}
        </dl>

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={onSaveReceipt}
            className="btn-primary btn-md flex-1"
          >
            <DownloadIcon className="h-4 w-4" />
            {receiptSaved ? q.result.receiptSaved : q.result.saveReceipt}
          </button>
          <button
            type="button"
            onClick={() => setSent(null)}
            className="btn-outline btn-md flex-1"
          >
            <PlusIcon className="h-4 w-4" />
            {q.result.newOrder}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card rounded-xl border-white/10 p-6 sm:p-10">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="of-firstName"
              className="mb-1.5 block text-sm font-medium text-steel-300"
            >
              {q.firstName} *
            </label>
            <input
              id="of-firstName"
              name="firstName"
              type="text"
              required
              autoComplete="given-name"
              placeholder={q.firstName}
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="of-lastName"
              className="mb-1.5 block text-sm font-medium text-steel-300"
            >
              {q.lastName} *
            </label>
            <input
              id="of-lastName"
              name="lastName"
              type="text"
              required
              autoComplete="family-name"
              placeholder={q.lastName}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="of-phone"
            className="mb-1.5 block text-sm font-medium text-steel-300"
          >
            {q.phone} *
          </label>
          <input
            id="of-phone"
            name="phone"
            type="tel"
            dir="ltr"
            inputMode="tel"
            required
            autoComplete="tel"
            placeholder="+213 ..."
            className={cn(inputClass, "text-start")}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="of-orderDate"
              className="mb-1.5 block text-sm font-medium text-steel-300"
            >
              {q.orderDate}
            </label>
            <input
              id="of-orderDate"
              name="orderDate"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="of-serviceType"
              className="mb-1.5 block text-sm font-medium text-steel-300"
            >
              {q.serviceType} *
            </label>
            <select
              id="of-serviceType"
              name="serviceType"
              required
              defaultValue=""
              className={cn(inputClass, "appearance-none")}
            >
              <option value="" disabled>
                {q.servicePlaceholder}
              </option>
              <option value="IMPRESSION_3D">{q.services.impression}</option>
              <option value="CONCEPTION_3D">{q.services.conception}</option>
              <option value="CONCEPTION_AND_IMPRESSION">
                {q.services.both}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="of-description"
            className="mb-1.5 block text-sm font-medium text-steel-300"
          >
            {q.description} *
          </label>
          <textarea
            id="of-description"
            name="description"
            required
            rows={6}
            placeholder={q.descriptionPlaceholder}
            className={cn(inputClass, "resize-none")}
          />
        </div>

        {/* Delivery method */}
        <div className="space-y-4 rounded-xl border border-white/10 bg-ink-900/50 p-4 sm:p-5">
          <p className="text-sm font-semibold text-white">{q.delivery}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <DeliveryCard
              active={deliveryMethod === "pickup"}
              onClick={() => setDeliveryMethod("pickup")}
              icon={<MapPinIcon className="h-5 w-5" />}
              title={q.deliveryPickup}
              desc={q.deliveryPickupDesc}
              meta={q.deliveryFree}
            />
            <DeliveryCard
              active={deliveryMethod === "courier"}
              onClick={() => setDeliveryMethod("courier")}
              icon={<BoxIcon className="h-5 w-5" />}
              title={q.deliveryCourier}
              desc={q.deliveryCourierDesc}
              meta={feeDisplay}
            />
          </div>

          {deliveryMethod === "courier" && (
            <>
              <div>
                <p className="mb-1.5 text-sm font-medium text-steel-300">
                  {q.deliveryOption}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <OptionRadio
                    active={courierOption === "office"}
                    onClick={() => setCourierOption("office")}
                    label={q.deliveryOffice}
                  />
                  <OptionRadio
                    active={courierOption === "home"}
                    onClick={() => setCourierOption("home")}
                    label={q.deliveryHome}
                  />
                </div>
              </div>

              {hasDeliveryData ? (
                <div className="space-y-4">
                  {/* Wilaya selection (delivery data available) */}
                  <div>
                    <label
                      htmlFor="of-wilaya"
                      className="mb-1.5 block text-sm font-medium text-steel-300"
                    >
                      {q.deliveryWilaya} *
                    </label>
                    <select
                      id="of-wilaya"
                      required
                      value={wilayaId ?? ""}
                      onChange={(e) => {
                        setWilayaId(e.target.value ? Number(e.target.value) : null);
                      }}
                      className={cn(inputClass, "appearance-none")}
                    >
                      <option value="" disabled>
                        {q.deliverySelectWilaya}
                      </option>
                      {wilayas.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Home delivery only: customer address */}
                  {courierOption === "home" && (
                    <div>
                      <label
                        htmlFor="of-address"
                        className="mb-1.5 block text-sm font-medium text-steel-300"
                      >
                        {q.deliveryAddress} *
                      </label>
                      <textarea
                        id="of-address"
                        required
                        rows={2}
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder={q.deliveryAddressPlaceholder}
                        className={cn(inputClass, "resize-none")}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="rounded-lg bg-ink-800/60 px-3 py-3 text-xs text-steel-400">
                  Les données de livraison ne sont pas encore configurées.
                </p>
              )}
            </>
          )}

          <div className="flex items-center justify-between rounded-lg bg-ink-800 px-4 py-3 text-sm">
            <span className="text-steel-400">{q.deliveryFee}</span>
            <span className="font-semibold text-white">{feeDisplay}</span>
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="btn-primary btn-md w-full disabled:opacity-60"
        >
          {sending ? q.sending : q.submit}
        </button>
        <p className="text-center text-xs leading-relaxed text-steel-500">
          {q.noteBeforeSubmit}
        </p>
      </form>
    </div>
  );
}

function DeliveryCard({
  active,
  onClick,
  icon,
  title,
  desc,
  meta,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
  meta: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border p-4 text-start transition",
        active
          ? "border-accent/60 bg-accent-dim"
          : "border-white/10 bg-ink-800 hover:border-white/20"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          active ? "bg-accent/20 text-accent" : "bg-ink-700 text-steel-300"
        )}
      >
        {icon}
      </span>
      <span className="mt-3 block text-sm font-semibold text-white">
        {title}
      </span>
      <span className="mt-1 block text-xs leading-relaxed text-steel-400">
        {desc}
      </span>
      <span
        className={cn(
          "mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
          active ? "bg-accent/20 text-accent" : "bg-ink-700 text-steel-300"
        )}
      >
        {meta}
      </span>
    </button>
  );
}

function OptionRadio({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition",
        active
          ? "border-accent/60 bg-accent-dim text-white"
          : "border-white/10 bg-ink-800 text-steel-300 hover:border-white/20"
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-full border",
          active ? "border-accent" : "border-steel-500"
        )}
      >
        {active && <span className="h-2 w-2 rounded-full bg-accent" />}
      </span>
      {label}
    </button>
  );
}