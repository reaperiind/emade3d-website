/**
 * Order persistence layer.
 *
 * On Netlify, orders are stored in a persistent Netlify Blob store ("orders").
 * Locally (next dev without Netlify context) a falling in-memory store is used
 * so the API and the admin UI can be developed without a Netlify environment.
 */

import { getStore, type Store } from "@netlify/blobs";
import {
  isStatusInFlow,
  type DeliveryInfo,
  type HistoryEntry,
  type OrderStatus,
} from "@/lib/order-flows";

export type { OrderStatus, HistoryEntry, DeliveryInfo } from "@/lib/order-flows";

export interface Order {
  /** Unique tracking code, e.g. "EMD-K7M3B2". */
  code: string;
  createdAt: string;
  status: OrderStatus;
  serviceType: string;
  firstName: string;
  lastName: string;
  phone: string;
  orderDate?: string;
  description: string;
  locale: string;
  /** Steps the order has passed through, in chronological order. */
  history: HistoryEntry[];
  /** Manual price set by the admin (shown to the customer from QUOTE_SENT). */
  price?: number | null;
  /** Currency shown next to the price (snapshot of the site settings). */
  currency?: string;
  /** How the customer wants to receive the order. */
  delivery?: DeliveryInfo;
}

const STORE_NAME = "orders";

/** Legacy statuses (pre-workflow) mapped to their workflow equivalent. */
const LEGACY_MAP: Record<string, OrderStatus> = {
  new: "SUBMITTED",
  processing: "CONFIRMED",
  shipped: "READY",
  done: "DELIVERED",
  cancelled: "CLOSED",
};

/**
 * Local (dev) fallback. Stored on globalThis because in "next dev" every route
 * handler is bundled separately, so a plain module-level variable would create
 * one isolated copy per route and orders would appear to vanish on PATCH/GET
 * single. On Netlify the Blob store is shared and persistent, so this fallback
 * is only used outside that environment.
 */
const MEMORY_KEY = "__emade3d_orders_memory__";

type MemoryStore = Map<string, Order>;

function getMemory(): MemoryStore {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!g[MEMORY_KEY]) g[MEMORY_KEY] = new Map<string, Order>();
  return g[MEMORY_KEY] as MemoryStore;
}

let blobStore: Store | null = null;
let blobFailed = false;

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

/** Upgrades an order written before the workflow change, if needed. */
function normalizeOrder(raw: Order): Order {
  const status = isStatusInFlow(raw.serviceType, raw.status)
    ? raw.status
    : (LEGACY_MAP[raw.status] ?? "SUBMITTED");
  const history: HistoryEntry[] =
    Array.isArray(raw.history) && raw.history.length > 0
      ? raw.history
      : [{ status, at: raw.createdAt }];
  return { ...raw, status, history };
}

export async function createOrder(order: Order): Promise<void> {
  const store = resolveStore();
  if (store) {
    await store.set(order.code, JSON.stringify(order));
    return;
  }
  getMemory().set(order.code, order);
}

export async function getAllOrders(): Promise<Order[]> {
  const store = resolveStore();
  if (store) {
    const { blobs } = await store.list({ paginate: false });
    const orders: Order[] = [];
    for (const { key } of blobs) {
      const raw = await store.get(key, { type: "text" });
      if (raw) orders.push(normalizeOrder(JSON.parse(raw) as Order));
    }
    return orders.sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt)
    );
  }
  return Array.from(getMemory().values())
    .map(normalizeOrder)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getOrder(code: string): Promise<Order | null> {
  const store = resolveStore();
  if (store) {
    const raw = await store.get(code, { type: "text" });
    return raw ? normalizeOrder(JSON.parse(raw) as Order) : null;
  }
  const mem = getMemory().get(code);
  return mem ? normalizeOrder(mem) : null;
}

export interface OrderPatch {
  status?: OrderStatus;
  /** Replace the whole history (used when editing timestamps in the admin). */
  history?: HistoryEntry[];
  price?: number | null;
  currency?: string;
  delivery?: DeliveryInfo;
  /** Status change is appended to the history at this time (ISO) — default now. */
  at?: string;
}

export async function updateOrder(
  code: string,
  patch: OrderPatch
): Promise<Order | null> {
  const existing = await getOrder(code);
  if (!existing) return null;

  const updated: Order = { ...existing };
  if (patch.status) {
    updated.status = patch.status;
    const at = patch.at ?? new Date().toISOString();
    updated.history = [
      ...existing.history,
      { status: patch.status, at },
    ];
  }
  if (patch.history) {
    updated.history = patch.history;
    const last = updated.history[updated.history.length - 1];
    if (last) updated.status = last.status;
  }
  if (patch.price !== undefined) updated.price = patch.price;
  if (patch.currency !== undefined) updated.currency = patch.currency;
  if (patch.delivery) updated.delivery = patch.delivery;

  const store = resolveStore();
  if (store) {
    await store.set(code, JSON.stringify(updated));
  } else {
    getMemory().set(code, updated);
  }
  return updated;
}

/** Kept as an alias for the status-only update used by simple flows. */
export async function updateOrderStatus(
  code: string,
  status: OrderStatus
): Promise<Order | null> {
  return updateOrder(code, { status });
}

export async function deleteOrder(code: string): Promise<void> {
  const store = resolveStore();
  if (store) {
    await store.delete(code);
  } else {
    getMemory().delete(code);
  }
}