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

/** Shared admin styling — warm cream + amber (DZBuild-style dashboard). */
export const inputClass =
  "w-full rounded-xl border border-[#e6d9bf] bg-white px-3.5 py-2.5 text-sm text-[#2b2b46] placeholder:text-[#b3ab9c] shadow-[0_1px_2px_rgba(27,26,45,0.04)] transition focus:border-[#f7a921] focus:outline-none focus:ring-4 focus:ring-[#f7a921]/15";

export const labelClass = "mb-1.5 block text-xs font-semibold text-[#6b6878]";

export const panelCard =
  "rounded-[20px] border border-[#f0e6d2] bg-white p-5 shadow-[0_6px_20px_rgba(27,26,45,0.05)] sm:p-6";

export const panelHeading =
  "font-display text-lg font-bold text-[#2b2b46]";

export const panelMuted = "mt-1 text-sm leading-relaxed text-[#6b6878]";

export const saveButton =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-dzb-amber px-5 py-2.5 text-sm font-bold text-dzb-inkdark shadow-[0_8px_20px_-8px_rgba(247,169,33,0.8)] transition hover:bg-dzb-amberdeep disabled:opacity-50";

export const secondaryButton =
  "inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-dzb-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-dzb-navy transition hover:border-dzb-amber hover:text-dzb-amberink disabled:opacity-50";

export const dangerButton =
  "inline-flex items-center justify-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50";