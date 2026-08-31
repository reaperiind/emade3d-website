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
      <p className="mt-10 text-center text-dzb-faint">
        Chargement des paramètres…
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={panelHeading}>Informations du site</h2>
          <p className={panelMuted}>
            Ces coordonnées sont affichées dans le pied de page, la page contact
            et les pages FAQ / formulaire de contact du site public.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className={saveButton}
          >
            {saving ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-dzb-inkdark/30 border-t-dzb-inkdark" />
                Enregistrement…
              </>
            ) : (
              "Enregistrer"
            )}
          </button>
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600">
              Impossible d&apos;enregistrer les informations.
            </p>
          )}
          {saved && (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
              Informations enregistrées.
            </p>
          )}
        </div>
      </div>

      <section className={panelCard}>
        <h3 className="text-base font-semibold text-dzb-navy">
          Coordonnées
        </h3>
        <p className="mb-4 mt-0.5 text-xs text-dzb-muted">
          Numéros de téléphone, WhatsApp et adresse email de contact.
        </p>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Téléphone (affiché)</label>
              <input
                value={contact?.phone ?? ""}
                onChange={(e) => setContactField("phone", e.target.value)}
                dir="ltr"
                placeholder="+213 555 000 000"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Lien du téléphone</label>
              <input
                value={contact?.phoneHref ?? ""}
                onChange={(e) => setContactField("phoneHref", e.target.value)}
                dir="ltr"
                placeholder="tel:+213555000000"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>WhatsApp (affiché)</label>
              <input
                value={contact?.whatsapp ?? ""}
                onChange={(e) => setContactField("whatsapp", e.target.value)}
                dir="ltr"
                placeholder="+213 555 000 000"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Lien WhatsApp</label>
              <input
                value={contact?.whatsappHref ?? ""}
                onChange={(e) =>
                  setContactField("whatsappHref", e.target.value)
                }
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
              placeholder="contact@example.com"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section className={panelCard}>
        <h3 className="text-base font-semibold text-dzb-navy">
          Adresse & horaires
        </h3>
        <p className="mb-4 mt-0.5 text-xs text-dzb-muted">
          Adresse postale et horaires d&apos;ouverture dans chaque langue, ainsi
          que l&apos;embed Google Maps.
        </p>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Adresse — FR</label>
              <input
                value={contact?.address_fr ?? ""}
                onChange={(e) =>
                  setContactField("address_fr", e.target.value)
                }
                placeholder="Zone Industrielle, Alger"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Adresse — EN</label>
              <input
                value={contact?.address_en ?? ""}
                onChange={(e) =>
                  setContactField("address_en", e.target.value)
                }
                placeholder="Industrial Zone, Algiers"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Adresse — AR</label>
              <input
                value={contact?.address_ar ?? ""}
                onChange={(e) =>
                  setContactField("address_ar", e.target.value)
                }
                dir="rtl"
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Horaires — FR</label>
              <input
                value={contact?.hours_fr ?? ""}
                onChange={(e) =>
                  setContactField("hours_fr", e.target.value)
                }
                placeholder="Lun – Sam : 08h30 – 18h00"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Horaires — EN</label>
              <input
                value={contact?.hours_en ?? ""}
                onChange={(e) =>
                  setContactField("hours_en", e.target.value)
                }
                placeholder="Mon – Sat: 8:30 AM – 6:00 PM"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Horaires — AR</label>
              <input
                value={contact?.hours_ar ?? ""}
                onChange={(e) =>
                  setContactField("hours_ar", e.target.value)
                }
                dir="rtl"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>
              Carte (lien d&apos;intégration Google Maps)
            </label>
            <input
              value={contact?.mapEmbed ?? ""}
              onChange={(e) => setContactField("mapEmbed", e.target.value)}
              dir="ltr"
              placeholder="https://www.google.com/maps/embed?..."
              className={cn(inputClass, "font-mono text-xs")}
            />
          </div>
        </div>
      </section>

      <section className={panelCard}>
        <h3 className="text-base font-semibold text-dzb-navy">
          Réseaux sociaux
        </h3>
        <p className="mb-4 mt-0.5 text-xs text-dzb-muted">
          Liens vers les profils officiels sur chaque plateforme.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["Facebook", "facebook"],
              ["Instagram", "instagram"],
              ["TikTok", "tiktok"],
              ["LinkedIn", "linkedin"],
              ["YouTube", "youtube"],
              ["X (Twitter)", "x"],
            ] as const
          ).map(([label, key]) => (
            <div key={key}>
              <label className={labelClass}>{label}</label>
              <input
                value={social?.[key] ?? ""}
                onChange={(e) => setSocialField(key, e.target.value)}
                placeholder="https://…"
                dir="ltr"
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
