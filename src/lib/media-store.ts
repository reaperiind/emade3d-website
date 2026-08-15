/**
 * Project image storage persisted in Netlify Blobs ("media").
 *
 * Images are uploaded by the admin and stored as binary blobs keyed by a
 * generated id. They are served publicly via GET /api/media/[key] with the
 * stored content type.
 */

import { getStore, type Store } from "@netlify/blobs";

const STORE_NAME = "media";

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

const ALLOWED_EXT = new Set([
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "avif",
  "svg",
]);

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
};

export function sanitizeMediaKey(key: string): string | null {
  return /^[a-z0-9-]+\.(png|jpg|jpeg|webp|gif|avif|svg)$/i.test(key)
    ? key.toLowerCase()
    : null;
}

export function makeMediaKey(originalName: string): string {
  const dot = originalName.lastIndexOf(".");
  const ext = dot >= 0 ? originalName.slice(dot + 1).toLowerCase() : "jpg";
  const safeExt = ALLOWED_EXT.has(ext) ? ext : "jpg";
  const id = crypto.randomUUID();
  return `${id}.${safeExt}`;
}

export function contentTypeFor(key: string): string {
  const dot = key.lastIndexOf(".");
  const ext = dot >= 0 ? key.slice(dot + 1).toLowerCase() : "jpg";
  return CONTENT_TYPES[ext] ?? "application/octet-stream";
}

export async function putMedia(
  key: string,
  data: Blob | ArrayBuffer,
  contentType?: string
): Promise<void> {
  const store = resolveStore();
  const meta = { contentType: contentType ?? contentTypeFor(key) };
  if (store) {
    await store.set(key, data, { metadata: meta });
  } else {
    getMemory()[key] = { data, meta };
  }
}

export async function getMedia(
  key: string
): Promise<{ data: ArrayBuffer; contentType: string } | null> {
  const store = resolveStore();
  if (store) {
    const result = await store.getWithMetadata(key, { type: "arrayBuffer" });
    if (!result) return null;
    const meta = (result.metadata ?? {}) as Record<string, string>;
    return {
      data: result.data,
      contentType: meta.contentType ?? contentTypeFor(key),
    };
  }
  const entry = getMemory()[key] as
    | { data: Blob | ArrayBuffer; meta: { contentType: string } }
    | undefined;
  if (!entry) return null;
  const buf =
    entry.data instanceof ArrayBuffer
      ? entry.data
      : await (entry.data as Blob).arrayBuffer();
  return { data: buf, contentType: entry.meta.contentType };
}

export async function deleteMedia(key: string): Promise<void> {
  const store = resolveStore();
  if (store) {
    await store.delete(key);
  } else {
    delete getMemory()[key];
  }
}

const MEMORY_KEY = "__emade3d_media_memory__";

function getMemory(): Record<string, unknown> {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!g[MEMORY_KEY]) g[MEMORY_KEY] = {};
  return g[MEMORY_KEY] as Record<string, unknown>;
}