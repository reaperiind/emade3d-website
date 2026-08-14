"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/i18n/provider";
import { portalTrackingUrl } from "@/config/site";
import { cn } from "@/lib/cn";
import { CheckIcon } from "@/components/ui/icons";

const inputClass =
  "w-full rounded-md border border-white/12 bg-ink-900 px-4 py-3 text-sm text-white placeholder:text-steel-500 transition focus:border-accent/60 focus:outline-none";

/**
 * Tracking form mirroring the portal's "Suivre une commande" page
 * (https://portal.emade3d.store/{locale}/track).
 *
 * The main site has no backend of its own (by design): on submit the customer
 * is redirected to the Emade3D Portal to see the detailed status of their order.
 */
export function TrackForm() {
  const { locale, t } = useI18n();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const track = t.track;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    window.open(portalTrackingUrl(locale), "_blank", "noopener,noreferrer");
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
            {track.note}
          </p>
        </div>
      ) : (
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
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              placeholder={track.codePlaceholder}
              className={cn(inputClass, "font-mono uppercase tracking-widest")}
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="btn-primary btn-md w-full disabled:opacity-60"
          >
            {sending ? track.sending : track.submit}
          </button>
          <p className="text-center text-xs leading-relaxed text-steel-500">
            {track.note}
          </p>
        </form>
      )}
    </div>
  );
}