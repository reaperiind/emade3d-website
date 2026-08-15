/**
 * Site-wide settings persisted in Netlify Blobs ("settings").
 *
 * Holds the delivery configuration used by the order form and the tracking
 * page: pickup option, courier offices (id / name / address / fee), home
 * delivery fee, currency, plus the courier (Guepex) credentials and the
 * location data imported from the courier API (wilayas, communes, offices).
 *
 * Security: the courier API token is stored here (the blob store is private
 * to the site) and is NEVER returned by the public endpoints — use
 * `sanitizeSettings()` before serving settings to a client.
 */

import { getStore, type Store } from "@netlify/blobs";

export interface Office {
  id: string;
  name: string;
  address: string;
  fee: number;
  /** Courier center id when imported from Guepex. */
  centerId?: string;
}

export interface Wilaya {
  id: number;
  name: string;
  nameAr?: string;
}

export interface Commune {
  id: number;
  wilayaId: number;
  name: string;
  nameAr?: string;
}

export type CourierProvider = "guepex";

export interface CourierConfig {
  provider: CourierProvider;
  /** Display name, e.g. "Guepex". */
  name: string;
  apiId: string;
  apiToken: string;
  enabled: boolean;
  /** Origin wilaya of the site (where shipments are sent from). */
  fromWilayaId: number | null;
  lastImportedAt?: string;
}

export interface DeliverySettings {
  /** Whether pickup at the site is available. */
  pickupAvailable: boolean;
  /** Delivery offices offered to the customer (manual or imported). */
  offices: Office[];
  /** Fallback fee for home delivery (used when the courier API fails). */
  homeFee: number;
  /** Message shown next to pickup, e.g. address/hours. */
  pickupNote: string;
  /** Courier (Guepex) connection, credentials + imported data. */
  courier?: CourierConfig;
  /** Wilayas imported from the courier. */
  wilayas?: Wilaya[];
  /** Communes imported from the courier. */
  communes?: Commune[];
}

export interface SiteSettings {
  delivery: DeliverySettings;
  /** Display currency, e.g. "DA", "DZD", "€". */
  currency: string;
}

/** Courier block safe for public consumption (no apiId / apiToken). */
export interface PublicCourierConfig {
  provider: CourierProvider;
  name: string;
  enabled: boolean;
  fromWilayaId: number | null;
  lastImportedAt?: string;
  hasCredentials: boolean;
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
      ...(settings.delivery?.courier && hasCourierFields(settings.delivery.courier)
        ? { courier: settings.delivery.courier }
        : {}),
      ...(Array.isArray(settings.delivery?.wilayas)
        ? { wilayas: settings.delivery.wilayas }
        : {}),
      ...(Array.isArray(settings.delivery?.communes)
        ? { communes: settings.delivery.communes }
        : {}),
    },
  };
}

function hasCourierFields(c: CourierConfig): boolean {
  return typeof c === "object" && c !== null && Boolean(c.apiId || c.apiToken || c.name);
}

/**
 * Removes the courier credentials so the settings can be served to the
 * public / admin client without exposing the API id or token.
 */
export function sanitizeSettings(settings: SiteSettings): SiteSettings {
  const c = settings.delivery.courier;
  const courier: PublicCourierConfig | undefined = c
    ? {
        provider: c.provider,
        name: c.name,
        enabled: c.enabled,
        fromWilayaId: c.fromWilayaId,
        lastImportedAt: c.lastImportedAt,
        hasCredentials: Boolean(c.apiId && c.apiToken),
      }
    : undefined;

  return {
    currency: settings.currency,
    delivery: {
      pickupAvailable: settings.delivery.pickupAvailable,
      pickupNote: settings.delivery.pickupNote,
      homeFee: settings.delivery.homeFee,
      offices: settings.delivery.offices,
      wilayas: settings.delivery.wilayas,
      communes: settings.delivery.communes,
      courier,
    },
  } as unknown as SiteSettings;
}