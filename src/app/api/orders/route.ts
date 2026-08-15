import { NextResponse } from "next/server";
import {
  createOrder,
  getAllOrders,
  type Order,
} from "@/lib/orders-store";
import { generateTrackingCode } from "@/lib/order-code";
import { isAuthorized } from "@/lib/admin-auth";
import { getSettings } from "@/lib/settings-store";
import type { DeliveryInfo } from "@/lib/order-flows";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_SERVICES = [
  "IMPRESSION_3D",
  "CONCEPTION_3D",
  "CONCEPTION_AND_IMPRESSION",
] as const;

interface OrderPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  orderDate?: string;
  serviceType?: string;
  description?: string;
  locale?: string;
  delivery?: DeliveryInfo;
}

function clean(v: unknown, max = 200): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/**
 * Validates the delivery payload and computes the delivery fee from the
 * current site settings (courier office fees / home fee, pickup = 0).
 */
async function sanitizeDelivery(raw: unknown): Promise<DeliveryInfo | undefined> {
  if (!raw || typeof raw !== "object") return undefined;
  const d = raw as Record<string, unknown>;
  const method =
    d.method === "courier" ? "courier" : d.method === "pickup" ? "pickup" : undefined;
  if (!method) return undefined;
  if (method === "pickup") return { method, fee: 0 };

  const option = d.option === "home" ? "home" : "office";
  const officeId = clean(d.officeId, 60);
  const address = clean(d.address, 500);
  const settings = await getSettings();
  let fee = settings.delivery.homeFee || 0;
  if (option === "office") {
    const office = settings.delivery.offices.find((o) => o.id === officeId);
    fee = office?.fee ?? 0;
  }
  return { method, option, officeId, address, fee };
}

// POST /api/orders — create a new order, returns the generated tracking code.
export async function POST(request: Request) {
  let payload: OrderPayload;
  try {
    payload = (await request.json()) as OrderPayload;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const firstName = clean(payload.firstName, 60);
  const lastName = clean(payload.lastName, 60);
  const phone = clean(payload.phone, 30);
  const description = clean(payload.description, 2000);
  const orderDate = clean(payload.orderDate, 10);
  const locale = clean(payload.locale, 5) || "fr";
  const serviceType = clean(payload.serviceType, 40);

  if (!firstName || !lastName || !phone || !description) {
    return NextResponse.json(
      { error: "missing_fields" },
      { status: 400 }
    );
  }
  if (!ALLOWED_SERVICES.includes(serviceType as never)) {
    return NextResponse.json({ error: "invalid_service" }, { status: 400 });
  }

  // Generate a unique code: the body is small, so retry a handful of times.
  const existing = await getAllOrders();
  const usedCodes = new Set(existing.map((o) => o.code));

  let code = generateTrackingCode();
  let attempts = 0;
  while (usedCodes.has(code) && attempts < 10) {
    code = generateTrackingCode();
    attempts++;
  }
  if (usedCodes.has(code)) {
    return NextResponse.json({ error: "code_exhausted" }, { status: 500 });
  }

  const delivery = await sanitizeDelivery(payload.delivery);
  const settings = await getSettings();
  const now = new Date().toISOString();

  const order: Order = {
    code,
    createdAt: now,
    status: "SUBMITTED",
    history: [{ status: "SUBMITTED", at: now }],
    firstName,
    lastName,
    phone,
    orderDate,
    serviceType,
    description,
    locale,
    currency: settings.currency,
    delivery,
  };

  try {
    await createOrder(order);
  } catch {
    return NextResponse.json({ error: "storage_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, code }, { status: 201 });
}

// GET /api/orders — admin only, lists all orders.
export async function GET(request: Request) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const orders = await getAllOrders();
  return NextResponse.json({ orders });
}