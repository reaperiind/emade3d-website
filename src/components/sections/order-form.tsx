"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/i18n/provider";
import { portalNewOrderUrl } from "@/config/site";
import { cn } from "@/lib/cn";
import { CheckIcon } from "@/components/ui/icons";

const inputClass =
  "w-full rounded-md border border-white/12 bg-ink-900 px-4 py-3 text-sm text-white placeholder:text-steel-500 transition focus:border-accent/60 focus:outline-none";

/**
 * Order form mirroring the portal's "Nouvelle commande" page
 * (https://portal.emade3d.store/{locale}/new).
 *
 * The main site has no backend of its own (by design): on submit the customer
 * is redirected to the existing Emade3D Portal where the order is actually
 * created, tracked and confirmed.
 */
export function OrderForm() {
  const { locale, t } = useI18n();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const q = t.quote;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    window.open(portalNewOrderUrl(locale), "_blank", "noopener,noreferrer");
    window.setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 700);
  }

  return (
    <div className="card rounded-xl border-white/10 p-6 sm:p-10">
      {sent ? (
        <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent-dim p-5">
          <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <p className="text-sm leading-relaxed text-steel-100">
            {q.noteBeforeSubmit}
          </p>
        </div>
      ) : (
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
      )}
    </div>
  );
}