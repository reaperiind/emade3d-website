"use client";

import { useEffect, useState } from "react";
import type { AdminSettings } from "./admin-types";
import { cn } from "@/lib/cn";
import {
  inputClass,
  labelClass,
  panelCard,
  panelHeading,
  panelMuted,
  saveButton,
} from "./admin-types";

type Contact = NonNullable<AdminSettings["contact"]>;
type Social = NonNullable<AdminSettings["social"]>;

function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="mt-6 rounded-lg border border-[#f0e6d2] bg-[#fdfaf3]/60 p-4">
      <legend className="px-1.5 text-xs font-semibold uppercase tracking-widest text-[#6b6878]">
        {legend}
      </legend>
      <div className="space-y-3">{children}</div>
    </fieldset>
  );
}

export function InfoSettingsPanel({ token }: { token: string }) {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [social, setSocial] = useState<Social | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const s = json?.settings as AdminSettings | undefined;
        if (s) {
          setSettings(s);
          setContact(s.contact ?? null);
          setSocial(s.social ?? null);
        }
      })
      .catch(() => undefined);
  }, []);

  if (!settings) {
    return (
      <p className="mt-10 text-center text-[#9a97a6]">
        Chargement des paramÃ¨tresâ€¦
      </p>
    );
  }

  function setContactField(key: keyof Contact, value: string) {
    setContact((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  function setSocialField(key: keyof Social, value: string) {
    setSocial((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  async function onSave() {
    if (!contact || !social || !settings) return;
    setSaving(true);
    setError(false);
    setSaved(false);
    try {
      const payload: AdminSettings = {
        ...settings,
        contact,
        social,
      };
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError(true);
        return;
      }
      const json = await res.json();
      if (json.settings) {
        setSettings(json.settings);
        setContact(json.settings.contact);
        setSocial(json.settings.social);
      }
      setSaved(true);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  const textField = (
    label: string,
    key: keyof Contact,
    { rtl, placeholder }: { rtl?: boolean; placeholder?: string } = {}
  ) => (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        value={String(contact?.[key] ?? "")}
        onChange={(e) => setContactField(key, e.target.value)}
        dir={rtl ? "rtl" : undefined}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );

  const socialField = (label: string, key: keyof Social) => (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        value={social?.[key] ?? ""}
        onChange={(e) => setSocialField(key, e.target.value)}
        placeholder="https://â€¦"
        dir="ltr"
        className={inputClass}
      />
    </div>
  );

  return (
    <div className={panelCard}>
      <h2 className={panelHeading}>Informations du site</h2>
      <p className={panelMuted}>
        Ces coordonnÃ©es sont affichÃ©es dans le pied de page, la page contact et
        les pages FAQ / formulaire de contact du site public.
      </p>

      <Fieldset legend="CoordonnÃ©es">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>TÃ©lÃ©phone (affichÃ©)</label>
            <input
              value={contact?.phone ?? ""}
              onChange={(e) => setContactField("phone", e.target.value)}
              dir="ltr"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Lien du tÃ©lÃ©phone</label>
            <input
              value={contact?.phoneHref ?? ""}
              onChange={(e) => setContactField("phoneHref", e.target.value)}
              dir="ltr"
              placeholder="tel:+213555000000"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>WhatsApp (affichÃ©)</label>
            <input
              value={contact?.whatsapp ?? ""}
              onChange={(e) => setContactField("whatsapp", e.target.value)}
              dir="ltr"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Lien WhatsApp</label>
            <input
              value={contact?.whatsappHref ?? ""}
              onChange={(e) => setContactField("whatsappHref", e.target.value)}
              dir="ltr"
              placeholder="https://wa.me/213555000000"
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            value={contact?.email ?? ""}
            onChange={(e) => setContactField("email", e.target.value)}
            dir="ltr"
            className={inputClass}
          />
        </div>
      </Fieldset>

      <Fieldset legend="Adresse & horaires (par langue)">
        <div className="grid gap-3 sm:grid-cols-3">
          {textField("Adresse â€” FR", "address_fr", {
            placeholder: "Zone Industrielle, Alger",
          })}
          {textField("Adresse â€” EN", "address_en", {
            placeholder: "Industrial Zone, Algiers",
          })}
          {textField("Adresse â€” AR", "address_ar", { rtl: true })}
          {textField("Horaires â€” FR", "hours_fr", {
            placeholder: "Lun â€“ Sam : 08h30 â€“ 18h00",
          })}
          {textField("Horaires â€” EN", "hours_en", {
            placeholder: "Mon â€“ Sat: 8:30 AM â€“ 6:00 PM",
          })}
          {textField("Horaires â€” AR", "hours_ar", { rtl: true })}
        </div>
        <div>
          <label className={labelClass}>Carte (lien d&apos;intÃ©gration Google Maps)</label>
          <input
            value={contact?.mapEmbed ?? ""}
            onChange={(e) => setContactField("mapEmbed", e.target.value)}
            dir="ltr"
            className={cn(inputClass, "font-mono text-xs")}
          />
        </div>
      </Fieldset>

      <Fieldset legend="RÃ©seaux sociaux">
        <div className="grid gap-3 sm:grid-cols-2">
          {socialField("Facebook", "facebook")}
          {socialField("Instagram", "instagram")}
          {socialField("TikTok", "tiktok")}
          {socialField("LinkedIn", "linkedin")}
          {socialField("YouTube", "youtube")}
          {socialField("X (Twitter)", "x")}
        </div>
      </Fieldset>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className={cn(saveButton, "mt-6")}
      >
        {saving ? "Enregistrementâ€¦" : "Enregistrer"}
      </button>

      {error && (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          Impossible d&apos;enregistrer les informations.
        </p>
      )}
      {saved && (
        <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          Informations enregistrÃ©es.
        </p>
      )}
    </div>
  );
}