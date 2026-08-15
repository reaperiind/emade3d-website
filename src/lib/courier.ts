/**
 * Thin client for the Guepex delivery API.
 *
 * Base URL and auth follow the same platform conventions as Yalidine:
 * request headers `X-API-Id` / `X-API-Token`, responses wrapped in
 * `{ success, data }`. Endpoint paths are documented by the community SDK
 * (npm `yalidine`) and mirror the Yalidine platform; they are isolated as
 * constants so they can be aligned with the official per-account docs that
 * are available behind login (guepex.app/app/dev/docs/api/index.php).
 *
 * All calls run server-side only — the API id/token never leave the server.
 */

import {
  getSettings,
  type Commune,
  type CourierConfig,
  type Office,
  type Wilaya,
} from "@/lib/settings-store";
import type { Order } from "@/lib/orders-store";
import type { ServiceType } from "@/lib/order-flows";

const GUPEX_BASE = "https://api.guepex.app/v1";

const ENDPOINTS = {
  wilayas: "/api/wilaya",
  communes: "/api/communes",
  centers: "/api/centers",
  fees: "/api/fees",
  parcels: "/api/parcels",
} as const;

const TIMEOUT_MS = 15000;

export class CourierError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "CourierError";
    this.status = status;
  }
}

async function guepexConfig(): Promise<CourierConfig | null> {
  const c = (await getSettings()).delivery.courier;
  if (!c || !c.enabled || !c.apiId || !c.apiToken) return null;
  return c;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT";
  query?: Record<string, string | number | undefined>;
  body?: unknown;
}

async function request<T>(
  config: CourierConfig,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = new URL(GUPEX_BASE + path);
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: options.method ?? "GET",
      headers: {
        "X-API-Id": config.apiId,
        "X-API-Token": config.apiToken,
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new CourierError("Courier API unreachable");
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    let message = `Courier API error ${res.status}`;
    try {
      const json = (await res.json()) as { message?: string; error?: string };
      message = json?.message ?? json?.error ?? message;
    } catch {
      /* no body */
    }
    throw new CourierError(message, res.status);
  }

  const json = (await res.json()) as Record<string, unknown>;
  // Guepex/Yalidine wrap responses: { success, data }. Fall back to raw if not.
  return (json?.data as T) ?? (json as unknown as T);
}

export interface ImportResult {
  wilayas: Wilaya[];
  communes: Commune[];
  centers: Office[];
}

/** Fetches wilayas, communes and delivery centers from Guepex. */
export async function importDeliveryData(): Promise<ImportResult> {
  const config = await guepexConfig();
  if (!config) throw new CourierError("Courier not configured");

  const [wilayaJson, communeJson, centerJson] = await Promise.all([
    request<unknown[]>(config, ENDPOINTS.wilayas),
    request<unknown[]>(config, ENDPOINTS.communes),
    request<unknown[]>(config, ENDPOINTS.centers),
  ]);

  const wilayas: Wilaya[] = (Array.isArray(wilayaJson) ? wilayaJson : [])
    .map((w) => w as Record<string, unknown>)
    .filter((w) => w && Number.isFinite(Number(w?.id)))
    .map((w) => ({
      id: Number(w.id),
      name: String(w.name ?? w.name_fr ?? ""),
      nameAr: w.name_ar ? String(w.name_ar) : undefined,
    }));

  const communes: Commune[] = (Array.isArray(communeJson) ? communeJson : [])
    .map((c) => c as Record<string, unknown>)
    .filter((c) => c && Number.isFinite(Number(c?.id)))
    .map((c) => ({
      id: Number(c.id),
      wilayaId: Number(c.wilaya_id ?? c.wilayaId ?? 0),
      name: String(c.name ?? c.name_fr ?? ""),
      nameAr: c.name_ar ? String(c.name_ar) : undefined,
    }))
    .filter((c) => c.wilayaId > 0);

  const centers: Office[] = (Array.isArray(centerJson) ? centerJson : [])
    .map((c) => c as Record<string, unknown>)
    .filter((c) => c && (c?.id !== undefined || c?.name))
    .map((c) => ({
      id: String(c?.id ?? c?.code ?? `center-${Math.random()}`),
      name: String(c?.name ?? "Bureau"),
      address: String(c?.address ?? c?.wilaya ?? ""),
      fee: Number(c?.fee ?? 0) || 0,
      centerId: c?.id !== undefined ? String(c?.id) : undefined,
    }));

  return { wilayas, communes, centers };
}

export interface QuoteInput {
  fromWilayaId: number;
  toWilayaId: number;
  communeId?: number;
  /** "home" ships to an address; "office" ships to a delivery center. */
  deliveryType: "home" | "office";
}

/**
 * Returns the delivery fee in DA for the route, or null when the courier is
 * not configured / the API fails. Home delivery uses the commune-specific
 * fee when available, otherwise the wilaya fee. Falls back gracefully — the
 * caller decides the final default.
 */
export async function quoteDeliveryFee(
  input: QuoteInput
): Promise<number | null> {
  const config = await guepexConfig();
  if (!config) return null;

  const data = await request<{
    wilaya_fee?: number;
    stopdesk_delivery_price?: number;
    fees?: Array<Record<string, unknown>>;
  }>(config, ENDPOINTS.fees, {
    query: {
      from_wilaya_id: input.fromWilayaId,
      to_wilaya_id: input.toWilayaId,
    },
  });
  if (!data || typeof data !== "object") return null;

  const items = Array.isArray(data.fees) ? data.fees : [];
  const match =
    input.communeId == null
      ? undefined
      : items.find((f) => Number(f?.id ?? f?.commune_id) === input.communeId);

  if (input.deliveryType === "office") {
    const price =
      Number(match?.stopdesk_delivery_price) ||
      Number(match?.delivery_stopdesk_price) ||
      0;
    return price > 0 ? price : Number(data.stopdesk_delivery_price) || null;
  }

  const price = Number(match?.commune_fee) || 0;
  if (price > 0) return price;
  if (Number.isFinite(Number(data.wilaya_fee))) {
    const fee = Number(data.wilaya_fee);
    return fee > 0 ? fee : null;
  }
  return null;
}

export interface ShipmentInput {
  order: Order;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  doInsurance?: boolean;
  declaredValue?: number;
}

export interface ShipmentResult {
  id?: string;
  tracking: string;
}

const SERVICE_LABELS: Record<ServiceType, string> = {
  IMPRESSION_3D: "Impression 3D",
  CONCEPTION_3D: "Conception 3D",
  CONCEPTION_AND_IMPRESSION: "Conception + Impression 3D",
};

/** Creates a (cash-on-delivery) parcel in Guepex for the given order. */
export async function createShipment(
  input: ShipmentInput
): Promise<ShipmentResult> {
  const config = await guepexConfig();
  if (!config) throw new CourierError("Courier not configured");
  if (!config.fromWilayaId)
    throw new CourierError("Origin wilaya (source) is not configured");

  const settings = (await getSettings()).delivery;
  const d = input.order.delivery;
  if (!d || d.method !== "courier")
    throw new CourierError("Order has no courier delivery selected");
  if (d.option === "home" && !d.communeName && !d.communeId)
    throw new CourierError("Destination commune is required for home delivery");
  if (d.option === "home" && !d.address)
    throw new CourierError("Destination address is required for home delivery");

  const toWilayaName =
    settings.wilayas?.find((w) => w.id === d.wilayaId)?.name ?? "";
  const toCommuneName =
    d.communeName ?? settings.communes?.find((c) => c.id === d.communeId)?.name ?? "";
  const fromWilayaName =
    settings.wilayas?.find((w) => w.id === config.fromWilayaId)?.name ?? "";

  const productList =
    (SERVICE_LABELS[input.order.serviceType as ServiceType] ??
      input.order.serviceType.replace(/_/g, " ")) +
    " — " +
    input.order.description.slice(0, 80);

  const result = await request<Record<string, unknown>>(config, ENDPOINTS.parcels, {
    method: "POST",
    body: {
      order_id: input.order.code,
      from_wilaya_id: config.fromWilayaId,
      from_wilaya_name: fromWilayaName,
      firstname: input.order.firstName,
      familyname: input.order.lastName,
      contact_phone: input.order.phone,
      address: d.option === "home" ? d.address : "",
      to_wilaya_id: d.wilayaId ?? undefined,
      to_wilaya_name: toWilayaName,
      to_commune_id: d.communeId ?? undefined,
      to_commune_name: toCommuneName,
      product_list: productList,
      price: Math.max(0, Math.round(input.order.price ?? 0)),
      do_insurance: Boolean(input.doInsurance),
      declared_value: input.doInsurance
        ? Math.round(input.declaredValue ?? input.order.price ?? 0)
        : undefined,
      weight: Math.max(0, Number(input.weight ?? 0)),
      length: Number(input.length ?? 0) || undefined,
      width: Number(input.width ?? 0) || undefined,
      height: Number(input.height ?? 0) || undefined,
      freeshipping: false,
      is_stopdesk: d.option === "office",
      stopdesk_id:
        d.option === "office"
          ? settings.offices.find((o) => o.id === d.officeId)?.centerId ?? d.officeId
          : undefined,
      has_exchange: false,
    },
  });

  const tracking = String(result?.tracking ?? result?.id ?? "");
  if (!tracking) throw new CourierError("Guepex did not return a tracking number");
  return { id: result?.id ? String(result.id) : undefined, tracking };
}