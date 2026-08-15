/**
 * Site-wide settings persisted in Netlify Blobs ("settings").
 *
 * Currently holds the delivery configuration used by the order form and the
 * tracking page: pickup option, courier offices (id / name / address / fee),
 * home delivery fee and currency. The courier data will later be imported from
 * the delivery company's own API.
 */

import { getStore, type Store } from "@netlify/blobs";

export interface Office {
  id: string;
  name: string;
  address: string;
  fee: number;
}

export interface DeliverySettings {
  /** Whether pickup at the site is available. */
  pickupAvailable: boolean;
  /** Courier offices offered to the customer. */
  offices: Office[];
  /** Flat fee for home delivery (when the courier ships to an address). */
  homeFee: number;
  /** Message shown next to pickup, e.g. address/hours. */
  pickupNote: string;
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
  return {
    currency: settings.currency || DEFAULT_SETTINGS.currency,
    delivery: {
      pickupAvailable:
        settings.delivery?.pickupAvailable ?? DEFAULT_SETTINGS.delivery.pickupAvailable,
      pickupNote:
        settings.delivery?.pickupNote ?? DEFAULT_SETTINGS.delivery.pickupNote,
      homeFee: settings.delivery?.homeFee ?? DEFAULT_SETTINGS.delivery.homeFee,
      offices:
        Array.isArray(settings.delivery?.offices) && settings.delivery.offices.length > 0
          ? settings.delivery.offices
          : DEFAULT_SETTINGS.delivery.offices,
    },
  };
}