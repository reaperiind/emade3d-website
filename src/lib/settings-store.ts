/**
 * Site-wide settings persisted in Netlify Blobs ("settings").
 *
 * Holds the delivery configuration used by the order form and the tracking
 * page: pickup option, delivery offices (id / name / address / fee), delivery
 * wilayas and communes, per-wilaya home delivery fees and the currency.
 *
 * All delivery data is entered manually by the admin (or imported from an
 * Excel file) — there is no external courier API integration.
 */

import { getStore, type Store } from "@netlify/blobs";

export interface Office {
  id: string;
  name: string;
  address: string;
  fee: number;
}

export interface Wilaya {
  id: number;
  name: string;
  nameAr?: string;
  /** Home delivery fee in DA for this wilaya. */
  homeFee: number;
}

export interface Commune {
  id: number;
  wilayaId: number;
  name: string;
  nameAr?: string;
}

export interface DeliverySettings {
  /** Whether pickup at the site is available. */
  pickupAvailable: boolean;
  /** Delivery offices offered to the customer. */
  offices: Office[];
  /** Fallback home delivery fee (used when the wilaya has no fee set). */
  homeFee: number;
  /** Message shown next to pickup, e.g. address/hours. */
  pickupNote: string;
  /** Delivery wilayas. */
  wilayas: Wilaya[];
  /** Delivery communes, grouped by wilaya. */
  communes: Commune[];
}

export interface SiteSettings {
  delivery: DeliverySettings;
  /** Display currency, e.g. "DA", "DZD", "€". */
  currency: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  currency: "DA",
  delivery: {
    pickupAvailable: true,
    pickupNote: "Zone Industrielle, Alger",
    offices: [
      {
        id: "office-1",
        name: "Bureau Alger",
        address: "Zone Industrielle, Alger",
        fee: 500,
      },
    ],
    homeFee: 1000,
    wilayas: [],
    communes: [],
  },
};

const STORE_NAME = "settings";
const MEMORY_KEY = "__emade3d_settings_memory__";

let blobStore: Store | null = null;
let blobFailed = false;

function getMemory(): Record<string, unknown> {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!g[MEMORY_KEY]) g[MEMORY_KEY] = {};
  return g[MEMORY_KEY] as Record<string, unknown>;
}

function resolveStore(): Store | null {
  if (blobStore) return blobStore;
  if (blobFailed) return null;
  try {
    blobStore = getStore(STORE_NAME);
    return blobStore;
  } catch {
    blobFailed = true;
    return null;
  }
}

export async function getSettings(): Promise<SiteSettings> {
  const store = resolveStore();
  if (store) {
    const raw = await store.get("site", { type: "text" });
    if (raw) return mergeSettings(JSON.parse(raw) as SiteSettings);
    return DEFAULT_SETTINGS;
  }
  const mem = getMemory()["site"];
  return mergeSettings(mem ? (mem as SiteSettings) : DEFAULT_SETTINGS);
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  const merged = mergeSettings(settings);
  const store = resolveStore();
  if (store) {
    await store.set("site", JSON.stringify(merged));
  } else {
    getMemory()["site"] = merged;
  }
}

/** Ensures unknown/missing keys fall back to defaults. */
function mergeSettings(settings: SiteSettings): SiteSettings {
  const anySettings = settings as Partial<SiteSettings> & {
    delivery?: Partial<DeliverySettings>;
  };
  return {
    currency: anySettings.currency || DEFAULT_SETTINGS.currency,
    delivery: {
      pickupAvailable:
        anySettings.delivery?.pickupAvailable ??
        DEFAULT_SETTINGS.delivery.pickupAvailable,
      pickupNote:
        anySettings.delivery?.pickupNote ?? DEFAULT_SETTINGS.delivery.pickupNote,
      homeFee: anySettings.delivery?.homeFee ?? DEFAULT_SETTINGS.delivery.homeFee,
      offices:
        Array.isArray(anySettings.delivery?.offices) &&
        anySettings.delivery!.offices.length > 0
          ? anySettings.delivery!.offices
          : DEFAULT_SETTINGS.delivery.offices,
      wilayas: Array.isArray(anySettings.delivery?.wilayas)
        ? anySettings.delivery!.wilayas
        : [],
      communes: Array.isArray(anySettings.delivery?.communes)
        ? anySettings.delivery!.communes
        : [],
    },
  };
}