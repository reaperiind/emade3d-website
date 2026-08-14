/**
 * Order persistence layer.
 *
 * On Netlify, orders are stored in a persistent Netlify Blob store ("orders").
 * Locally (next dev without Netlify context) a falling in-memory store is used
 * so the API and the admin UI can be developed without a Netlify environment.
 */

import { getStore, type Store } from "@netlify/blobs";

export const ORDER_STATUSES = [
  "new",
  "processing",
  "shipped",
  "done",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  /** Unique tracking code, e.g. "EMD-K7M3B2". */
  code: string;
  createdAt: string;
  status: OrderStatus;
  firstName: string;
  lastName: string;
  phone: string;
  orderDate?: string;
  serviceType: string;
  description: string;
  locale: string;
}

const STORE_NAME = "orders";

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
      if (raw) orders.push(JSON.parse(raw) as Order);
    }
    return orders.sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt)
    );
  }
  return Array.from(getMemory().values()).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
}

export async function getOrder(code: string): Promise<Order | null> {
  const store = resolveStore();
  if (store) {
    const raw = await store.get(code, { type: "text" });
    return raw ? (JSON.parse(raw) as Order) : null;
  }
  return getMemory().get(code) ?? null;
}

export async function updateOrderStatus(
  code: string,
  status: OrderStatus
): Promise<Order | null> {
  const existing = await getOrder(code);
  if (!existing) return null;
  const updated = { ...existing, status };
  const store = resolveStore();
  if (store) {
    await store.set(code, JSON.stringify(updated));
  } else {
    getMemory().set(code, updated);
  }
  return updated;
}

export async function deleteOrder(code: string): Promise<void> {
  const store = resolveStore();
  if (store) {
    await store.delete(code);
  } else {
    getMemory().delete(code);
  }
}