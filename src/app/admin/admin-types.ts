import type { Office, Wilaya, Commune } from "@/lib/settings-store";

/** Admin-side settings shape (mirrors the persisted SiteSettings minus SEO). */
export interface AdminSettings {
  currency: string;
  delivery: {
    pickupAvailable: boolean;
    pickupNote: string;
    homeFee: number;
    offices: Office[];
    wilayas?: Wilaya[];
    communes?: Commune[];
  };
  contact?: {
    phone: string;
    phoneHref: string;
    whatsapp: string;
    whatsappHref: string;
    email: string;
    address_fr: string;
    address_en: string;
    address_ar: string;
    mapEmbed: string;
    hours_fr: string;
    hours_en: string;
    hours_ar: string;
  };
  social?: {
    facebook: string;
    instagram: string;
    tiktok: string;
    linkedin: string;
    youtube: string;
    x: string;
  };
}

/** Light-theme shared input styling used across admin panels. */
export const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

export const labelClass = "mb-1 block text-xs font-medium text-slate-500";

export const panelCard =
  "rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";

export const panelHeading =
  "font-display text-lg font-semibold text-slate-900";

export const panelMuted = "mt-1 text-sm leading-relaxed text-slate-500";

export const saveButton =
  "inline-flex items-center justify-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50";

export const secondaryButton =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-accent hover:text-accent disabled:opacity-50";

export const dangerButton =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50";