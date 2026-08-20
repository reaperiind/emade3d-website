/**
 * Products catalog persisted in Netlify Blobs ("products").
 *
 * Follows the same pattern as the projects catalog: seeded once from the demo
 * catalog in src/data/products.ts and then fully managed from the admin
 * "Produits" panel. The public products page reads from here so admin changes
 * are reflected live.
 */

import { getStore, type Store } from "@netlify/blobs";
import { demoProducts, type Product } from "@/data/products";

const STORE_NAME = "products";
const CATALOG_KEY = "catalog";

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

const MEMORY_KEY = "__emade3d_products_memory__";

function getMemory(): Record<string, unknown> {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!g[MEMORY_KEY]) g[MEMORY_KEY] = {};
  return g[MEMORY_KEY] as Record<string, unknown>;
}

export async function getProducts(): Promise<Product[]> {
  const store = resolveStore();
  if (store) {
    const raw = await store.get(CATALOG_KEY, { type: "text" });
    const parsed = raw ? (JSON.parse(raw) as Product[]) : null;
    if (Array.isArray(parsed)) return parsed;
    return seed(store);
  }
  const mem = getMemory()[CATALOG_KEY];
  if (Array.isArray(mem)) return mem as Product[];
  const seeded = await seed(null);
  getMemory()[CATALOG_KEY] = seeded;
  return seeded;
}

export async function saveProducts(products: Product[]): Promise<void> {
  await persist(products);
}

/** Seeds the catalog with the demo products on first access. */
async function seed(store: Store | null): Promise<Product[]> {
  const seeded: Product[] = demoProducts.map((p) => ({
    ...p,
    images: p.images ?? [],
  }));
  await persist(seeded, store);
  return seeded;
}

async function persist(
  products: Product[],
  storeOverride?: Store | null
): Promise<void> {
  const store = storeOverride ?? resolveStore();
  const data = JSON.stringify(products);
  if (store) {
    try {
      await store.set(CATALOG_KEY, data);
    } catch {
      getMemory()[CATALOG_KEY] = products;
    }
  } else {
    getMemory()[CATALOG_KEY] = products;
  }
}