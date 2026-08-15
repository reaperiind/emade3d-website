"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useI18n } from "@/i18n/provider";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { CheckIcon } from "@/components/ui/icons";

const inputClass =
  "w-full rounded-md border border-white/12 bg-ink-900 px-4 py-3 text-sm text-white placeholder:text-steel-500 transition focus:border-accent/60 focus:outline-none";

export function ContactForm() {
  const { locale, t } = useI18n();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState(site.contact.email);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.settings?.contact?.email) {
          setEmail(json.settings.contact.email);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const phone = String(data.get("phone") ?? "");
    const message = String(data.get("message") ?? "");

    const subject =
      locale === "ar"
        ? "رسالة من موقع Emade3D"
        : locale === "en"
          ? "Message from the Emade3D website"
          : "Message du site Emade3D";

    const body = [
      `--- ${name}`,
      email,
      phone ? `--- ${phone}` : "",
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    setSending(true);
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 600);
  }

  const form = t.contact.form;

  return (
    <div className="card rounded-xl border-white/10 p-6 sm:p-8">
      <h2 className="font-display text-xl font-semibold text-white">
        {form.title}
      </h2>

      {sent ? (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-accent/30 bg-accent-dim p-4">
          <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <p className="text-sm leading-relaxed text-steel-100">{form.success}</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cf-name" className="mb-1.5 block text-sm font-medium text-steel-300">
                {form.name} *
              </label>
              <input
                id="cf-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder={form.namePlaceholder}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="cf-email" className="mb-1.5 block text-sm font-medium text-steel-300">
                {form.email} *
              </label>
              <input
                id="cf-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={form.emailPlaceholder}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="cf-phone" className="mb-1.5 block text-sm font-medium text-steel-300">
              {form.phone}
            </label>
            <input
              id="cf-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder={form.phonePlaceholder}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="cf-message" className="mb-1.5 block text-sm font-medium text-steel-300">
              {form.message} *
            </label>
            <textarea
              id="cf-message"
              name="message"
              required
              rows={5}
              placeholder={form.messagePlaceholder}
              className={cn(inputClass, "resize-none")}
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="btn-primary btn-md w-full disabled:opacity-60"
          >
            {sending ? form.sending : form.submit}
          </button>
          <p className="text-center text-xs text-steel-500">{form.privacy}</p>
        </form>
      )}
    </div>
  );
}