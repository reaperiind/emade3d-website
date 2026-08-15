/**
 * Portfolio projects persisted in Netlify Blobs ("projects").
 *
 * The store is seeded once from the demo catalog in src/data/projects.ts and
 * then fully managed from the admin "Galerie" page (add / edit / reorder /
 * categorize / upload images). The public realisations pages read from here
 * so admin changes are reflected live.
 */

import { getStore, type Store } from "@netlify/blobs";
import {
  projects as demoProjects,
  type Project,
} from "@/data/projects";

const STORE_NAME = "projects";
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

const MEMORY_KEY = "__emade3d_projects_memory__";

function getMemory(): Record<string, unknown> {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!g[MEMORY_KEY]) g[MEMORY_KEY] = {};
  return g[MEMORY_KEY] as Record<string, unknown>;
}

export async function getProjects(): Promise<Project[]> {
  const store = resolveStore();
  if (store) {
    const raw = await store.get(CATALOG_KEY, { type: "text" });
    const parsed = raw ? (JSON.parse(raw) as Project[]) : null;
    if (Array.isArray(parsed)) return parsed;
    return seed(store);
  }
  const mem = getMemory()[CATALOG_KEY];
  if (Array.isArray(mem)) return mem as Project[];
  const seeded = await seed(null);
  getMemory()[CATALOG_KEY] = seeded;
  return seeded;
}

export async function saveProjects(projects: Project[]): Promise<void> {
  await persist(projects);
}

/** Seeds the catalog with the demo projects on first access. */
async function seed(store: Store | null): Promise<Project[]> {
  const seeded: Project[] = demoProjects.map((p) => ({
    ...p,
    images: p.images ?? [],
  }));
  await persist(seeded, store);
  return seeded;
}

async function persist(projects: Project[], storeOverride?: Store | null): Promise<void> {
  const store = storeOverride ?? resolveStore();
  const data = JSON.stringify(projects);
  if (store) {
    try {
      await store.set(CATALOG_KEY, data);
    } catch {
      getMemory()[CATALOG_KEY] = projects;
    }
  } else {
    getMemory()[CATALOG_KEY] = projects;
  }
}