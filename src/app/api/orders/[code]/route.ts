import { NextResponse } from "next/server";
import {
  deleteOrder,
  getOrder,
  updateOrderStatus,
  ORDER_STATUSES,
} from "@/lib/orders-store";
import { isAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { code: string } };

// PATCH /api/orders/:code — admin only, updates an order's status/deleting.
export async function PATCH(request: Request, { params }: Ctx) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const code = decodeURIComponent(params.code);
  let body: { status?: string };
  try {
    body = (await request.json()) as { status?: string };
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!ORDER_STATUSES.includes(body.status as never)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }
  const updated = await updateOrderStatus(code, body.status as never);
  if (!updated) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, order: updated });
}

// GET /api/orders/:code — public, used to look up one order (optional).
export async function GET(_request: Request, { params }: Ctx) {
  const code = decodeURIComponent(params.code);
  const order = await getOrder(code);
  if (!order) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ order });
}

// DELETE /api/orders/:code — admin only.
export async function DELETE(request: Request, { params }: Ctx) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const code = decodeURIComponent(params.code);
  await deleteOrder(code);
  return NextResponse.json({ ok: true });
}