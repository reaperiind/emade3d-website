import { NextResponse } from "next/server";
import {
  addProductOrder,
  deleteProductOrder,
  getProductOrders,
  type ProductOrder,
} from "@/lib/product-orders-store";
import { getProducts } from "@/lib/products-store";
import { notifyProductOrder } from "@/lib/product-email";
import { isAuthorized } from "@/lib/admin-auth";
import type { LocalizedText } from "@/lib/localize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(v: unknown, max = 300): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

// POST /api/product-orders — public. Records a product purchase request
// (completely separate from the order platform).
export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const productSlug = clean(payload.productSlug, 120);
  const productNameRaw = payload.productName as Partial<LocalizedText> | undefined;
  const customerName = clean(payload.customerName, 120);
  const phone = clean(payload.phone, 30);
  const quantity = Math.max(1, Math.round(Number(payload.quantity) || 1));
  const notes = clean(payload.notes, 1000);
  const locale = clean(payload.locale, 5) || "fr";

  if (!productSlug || !customerName || !phone) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const productName: LocalizedText =
    productNameRaw && typeof productNameRaw === "object"
      ? {
          fr: String(productNameRaw.fr ?? "").slice(0, 200),
          en: String(productNameRaw.en ?? "").slice(0, 200),
          ar: String(productNameRaw.ar ?? "").slice(0, 200),
        }
      : { fr: "", en: "", ar: "" };

  const order: ProductOrder = {
    id: `PO-${Date.now()}`,
    createdAt: new Date().toISOString(),
    productSlug,
    productName,
    customerName,
    phone,
    quantity,
    notes: notes || undefined,
    locale,
  };

  try {
    await addProductOrder(order);
  } catch {
    return NextResponse.json({ error: "storage_failed" }, { status: 500 });
  }

  const products = await getProducts().catch(() => []);
  const product = products.find((p) => p.slug === order.productSlug);
  // Best-effort email, non-blocking.
  void notifyProductOrder(order, product).catch(() => undefined);

  return NextResponse.json({ ok: true, id: order.id }, { status: 201 });
}

// GET /api/product-orders — admin only. Lists product purchase requests.
export async function GET(request: Request) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const orders = await getProductOrders();
  return NextResponse.json({ orders });
}

// DELETE /api/product-orders?id=... — admin only.
export async function DELETE(request: Request) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const id = clean(new URL(request.url).searchParams.get("id") ?? "", 120);
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }
  const orders = await deleteProductOrder(id);
  return NextResponse.json({ ok: true, orders });
}