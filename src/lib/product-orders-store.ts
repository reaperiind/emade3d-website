/**
 * Product purchase requests persisted in Netlify Blobs ("product-orders").
 *
 * Completely separate from the main orders platform: a customer browsing the
 * "Produits" page fills a dedicated purchase form (name, phone, quantity,
 * delivery info) which is stored here. The admin sees them in the "Produits"
 * admin panel and can contact the customer directly.
 */

import { getStore, type Store } from "@netlify/blobs";
import type { LocalizedText } from "@/lib/localize";
import type { DeliveryInfo } from "@/lib/order-flows";

export interface ProductOrder {
  id: string;
  createdAt: string;
  /** Snapshot of the product at purchase time. */
  productSlug: string;
  productName: LocalizedText;
  customerName: string;
  phone: string;
  quantity: number;
  /** Delivery chosen by the customer (same options as the order form). */
  delivery: DeliveryInfo;
  locale: string;
}

const STORE_NAME = "product-orders";
const LIST_KEY = "requests";

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

const MEMORY_KEY = "__emade3d_product_orders_memory__";

function getMemory(): Record<string, unknown> {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!g[MEMORY_KEY]) g[MEMORY_KEY] = {};
  return g[MEMORY_KEY] as Record<string, unknown>;
}

export async function getProductOrders(): Promise<ProductOrder[]> {
  const store = resolveStore();
  if (store) {
    const raw = await store.get(LIST_KEY, { type: "text" });
    const parsed = raw ? (JSON.parse(raw) as ProductOrder[]) : null;
    return Array.isArray(parsed) ? parsed : [];
  }
  const mem = getMemory()[LIST_KEY];
  return Array.isArray(mem) ? (mem as ProductOrder[]) : [];
}

export async function addProductOrder(
  order: ProductOrder
): Promise<ProductOrder[]> {
  const current = await getProductOrders();
  const next = [order, ...current];
  await persist(next);
  return next;
}

export async function deleteProductOrder(id: string): Promise<ProductOrder[]> {
  const current = await getProductOrders();
  const next = current.filter((o) => o.id !== id);
  await persist(next);
  return next;
}

async function persist(orders: ProductOrder[]): Promise<void> {
  const store = resolveStore();
  const data = JSON.stringify(orders);
  if (store) {
    try {
      await store.set(LIST_KEY, data);
    } catch {
      getMemory()[LIST_KEY] = orders;
    }
  } else {
    getMemory()[LIST_KEY] = orders;
  }
}