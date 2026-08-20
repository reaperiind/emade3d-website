import { NextResponse } from "next/server";
import { getProducts, saveProducts } from "@/lib/products-store";
import type { Product } from "@/data/products";
import { isAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/products — public. Returns the products catalog as managed in the
// admin Produits panel.
export async function GET() {
  const products = await getProducts();
  return NextResponse.json({ products });
}

// PUT /api/products — admin only. Replaces the whole catalog (ordering,
// availability and images are set by the admin Produits panel).
export async function PUT(request: Request) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as {
    products?: Product[];
  } | null;
  const incoming = body?.products;
  if (!Array.isArray(incoming)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const localizedField = (v: unknown, max: number) =>
    v && typeof v === "object"
      ? {
          fr: String((v as Record<string, unknown>).fr ?? "").slice(0, max),
          en: String((v as Record<string, unknown>).en ?? "").slice(0, max),
          ar: String((v as Record<string, unknown>).ar ?? "").slice(0, max),
        }
      : { fr: "", en: "", ar: "" };

  const cleanProduct = (p: Partial<Product>): Product | null => {
    const slug = String(p.slug ?? "").trim();
    const name = localizedField(p.name, 200);
    if (!slug || !name.fr) return null;
    const price = Math.max(0, Number(p.price) || 0);
    return {
      slug: slug.slice(0, 120),
      name,
      description: localizedField(p.description, 2000),
      price,
      available: Boolean(p.available),
      images: Array.isArray(p.images)
        ? p.images.filter((k) => typeof k === "string").slice(0, 12)
        : [],
    };
  };

  const cleaned = incoming
    .map(cleanProduct)
    .filter((p): p is Product => p !== null);
  await saveProducts(cleaned);
  return NextResponse.json({ ok: true, products: cleaned });
}