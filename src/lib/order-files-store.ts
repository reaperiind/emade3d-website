/**
 * Client order-file storage persisted in Netlify Blobs ("order-files").
 *
 * Design/3D files attached to an order are uploaded by the customer
 * (POST /api/order-files) and stored as binary blobs keyed by a generated id.
 * The stored file carries its content type and original name so the admin can
 * download it with a meaningful filename. A blob metadata entry is kept for
 * each blob: { name, contentType }.
 */

import { getStore, type Store } from "@netlify/blobs";
import type { OrderFile } from "@/lib/order-flows";

const STORE_NAME = "order-files";

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

/** Maximum payload accepted for a single attached file (20 MB). */
export const MAX_FILE_BYTES = 20 * 1024 * 1024;

/** Maximum number of files a customer may attach to one order. */
export const MAX_FILES_PER_ORDER = 5;

const ALLOWED_EXT = new Set([
  "stl",
  "obj",
  "step",
  "stp",
  "iges",
  "igs",
  "3mf",
  "sldprt",
  "pdf",
  "zip",
  "png",
  "jpg",
  "jpeg",
]);

const CONTENT_TYPES: Record<string, string> = {
  stl: "model/stl",
  obj: "model/obj",
  step: "model/step",
  stp: "model/step",
  iges: "model/iges",
  igs: "model/iges",
  "3mf": "model/3mf",
  sldprt: "application/sldprt",
  pdf: "application/pdf",
  zip: "application/zip",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

export function sanitizeOrderFileKey(key: string): string | null {
  return /^[a-z0-9-]+\.(stl|obj|step|stp|iges|igs|3mf|sldprt|pdf|zip|png|jpg|jpeg)$/i.test(
    key
  )
    ? key.toLowerCase()
    : null;
}

export function makeOrderFileKey(originalName: string): string {
  const dot = originalName.lastIndexOf(".");
  const ext = dot >= 0 ? originalName.slice(dot + 1).toLowerCase() : "stl";
  const safeExt = ALLOWED_EXT.has(ext) ? ext : "stl";
  return `${crypto.randomUUID()}.${safeExt}`;
}

export function contentTypeFor(key: string): string {
  const dot = key.lastIndexOf(".");
  const ext = dot >= 0 ? key.slice(dot + 1).toLowerCase() : "stl";
  return CONTENT_TYPES[ext] ?? "application/octet-stream";
}

export async function putOrderFile(
  key: string,
  data: Blob | ArrayBuffer,
  name: string,
  contentType?: string
): Promise<void> {
  const store = resolveStore();
  const meta = { name, contentType: contentType ?? contentTypeFor(key) };
  if (store) {
    await store.set(key, data, { metadata: meta });
  } else {
    getMemory()[key] = { data, meta };
  }
}

export async function getOrderFile(
  key: string
): Promise<{ data: ArrayBuffer; contentType: string; name: string } | null> {
  const store = resolveStore();
  if (store) {
    const result = await store.getWithMetadata(key, { type: "arrayBuffer" });
    if (!result) return null;
    const meta = (result.metadata ?? {}) as Record<string, string>;
    return {
      data: result.data,
      contentType: meta.contentType ?? contentTypeFor(key),
      name: meta.name ?? key,
    };
  }
  const entry = getMemory()[key] as
    | { data: Blob | ArrayBuffer; meta: { name: string; contentType: string } }
    | undefined;
  if (!entry) return null;
  const buf =
    entry.data instanceof ArrayBuffer
      ? entry.data
      : await (entry.data as Blob).arrayBuffer();
  return { data: buf, contentType: entry.meta.contentType, name: entry.meta.name };
}

export async function deleteOrderFile(key: string): Promise<void> {
  const store = resolveStore();
  if (store) {
    await store.delete(key);
  } else {
    delete getMemory()[key];
  }
}

/** Removes the files of a deleted order from the store. */
export async function deleteOrderFiles(fileKeys: string[]): Promise<void> {
  await Promise.all(
    fileKeys
      .map((k) => sanitizeOrderFileKey(k))
      .filter((k): k is string => k !== null)
      .map((k) => deleteOrderFile(k))
  );
}

const MEMORY_KEY = "__emade3d_order_files_memory__";

function getMemory(): Record<string, unknown> {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!g[MEMORY_KEY]) g[MEMORY_KEY] = {};
  return g[MEMORY_KEY] as Record<string, unknown>;
}

/** Validates an OrderFile entry (used by API routes). */
export function sanitizeOrderFile(raw: unknown): OrderFile | null {
  if (!raw || typeof raw !== "object") return null;
  const f = raw as Record<string, unknown>;
  const key = typeof f.key === "string" ? sanitizeOrderFileKey(f.key) : null;
  if (!key) return null;
  const name = typeof f.name === "string" ? f.name.trim().slice(0, 200) : key;
  const size =
    typeof f.size === "number" && Number.isFinite(f.size) && f.size >= 0
      ? Math.min(Math.floor(f.size), MAX_FILE_BYTES)
      : 0;
  return { key, name, size };
}