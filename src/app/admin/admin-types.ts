import type { Office, Wilaya, Commune } from "@/lib/settings-store";

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

export const inputClass =
  "w-full rounded-lg border border-dzb-creamline bg-white px-3.5 py-2.5 text-sm text-dzb-navy placeholder:text-dzb-faint/70 transition-colors focus:border-dzb-amber focus:outline-none focus:ring-2 focus:ring-dzb-amber/20";

export const labelClass =
  "mb-1.5 block text-[13px] font-medium text-dzb-muted";

export const panelCard =
  "rounded-xl border border-dzb-creamline bg-white p-5 shadow-sm";

export const panelHeading =
  "font-display text-lg font-bold text-dzb-navy";

export const panelMuted =
  "mt-1 text-sm leading-relaxed text-dzb-muted";

export const saveButton =
  "inline-flex items-center gap-2 rounded-lg bg-dzb-amber px-5 py-2.5 text-sm font-semibold text-dzb-inkdark shadow-sm transition-all hover:bg-dzb-amberdeep hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

export const secondaryButton =
  "inline-flex items-center gap-2 rounded-lg border border-dzb-creamline bg-white px-4 py-2.5 text-sm font-medium text-dzb-muted transition-colors hover:border-dzb-amber/50 hover:text-dzb-amberink";

export const dangerButton =
  "inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 hover:border-red-300";
