import { NextResponse } from "next/server";
import {
  deleteOrder,
  getOrder,
  updateOrder,
  type OrderPatch,
} from "@/lib/orders-store";
import { isAuthorized } from "@/lib/admin-auth";
import {
  deleteOrderFiles,
  sanitizeOrderFile,
} from "@/lib/order-files-store";
import {
  statusesFor,
  isStatusInFlow,
  type OrderStatus,
  type HistoryEntry,
  type DeliveryInfo,
  type ProductionProgressStep,
  type ProductionNote,
  type ProgressNote,
} from "@/lib/order-flows";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { code: string } };

// PATCH /api/orders/:code — admin only, updates status / price / history / delivery.
export async function PATCH(request: Request, { params }: Ctx) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const code = decodeURIComponent(params.code);
  const order = await getOrder(code);
  if (!order) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const flow = statusesFor(order.serviceType);
  const patch: OrderPatch = {};

  if (body.status !== undefined) {
    const status = String(body.status);
    if (!flow.includes(status as OrderStatus)) {
      return NextResponse.json({ error: "invalid_status" }, { status: 400 });
    }
    patch.status = status as OrderStatus;
    if (typeof body.at === "string" && body.at) patch.at = body.at;
  }

  if (body.price !== undefined && body.price !== null) {
    const price = Number(body.price);
    patch.price = Number.isFinite(price) && price > 0 ? price : null;
    // Refresh the currency snapshot from the current site settings.
    const { getSettings } = await import("@/lib/settings-store");
    const settings = await getSettings();
    patch.currency = settings.currency;
  }

  // Full history replacement (used by the admin to edit timestamps). The
  // current status is derived from the last entry.
  if (Array.isArray(body.history)) {
    const history: HistoryEntry[] = [];
    for (const raw of body.history) {
      const h = raw as HistoryEntry;
      const status = String(h?.status ?? "");
      const at = String(h?.at ?? "");
      if (!flow.includes(status as OrderStatus) || !at) continue;
      history.push({ status: status as OrderStatus, at });
    }
    if (history.length === 0) {
      return NextResponse.json({ error: "invalid_history" }, { status: 400 });
    }
    patch.history = history;
  }

  if (body.delivery !== undefined && body.delivery !== null) {
    const d = body.delivery as Record<string, unknown>;
    const delivery: DeliveryInfo = {
      method: d.method === "courier" ? "courier" : "pickup",
      fee: Number(d.fee) || 0,
    };
    if (d.option === "home" || d.option === "office") delivery.option = d.option;
    if (typeof d.officeId === "string") delivery.officeId = d.officeId;
    if (typeof d.address === "string") delivery.address = d.address;
    patch.delivery = delivery;
  }

  if (body.files !== undefined && body.files !== null) {
    const files = Array.isArray(body.files)
      ? body.files
          .map(sanitizeOrderFile)
          .filter(
            (f): f is NonNullable<ReturnType<typeof sanitizeOrderFile>> =>
              f !== null
          )
          .slice(0, 5)
      : [];
    patch.files = files;
  }

  if (typeof body.adminNotes === "string") {
    patch.adminNotes = body.adminNotes.trim() || undefined;
  }

  if (body.productionProgress !== undefined && body.productionProgress !== null) {
    const progress = Number(body.productionProgress);
    const validSteps: ProductionProgressStep[] = [0, 25, 50, 75, 100];
    if (validSteps.includes(progress as ProductionProgressStep)) {
      patch.productionProgress = progress as ProductionProgressStep;
    }
  }

  if (Array.isArray(body.productionNotes)) {
    const notes: ProductionNote[] = [];
    for (const raw of body.productionNotes) {
      const n = raw as ProductionNote;
      const id = typeof n?.id === "string" && n.id ? n.id : crypto.randomUUID();
      const text = typeof n?.text === "string" ? n.text.trim() : "";
      const at = typeof n?.at === "string" && n.at ? n.at : new Date().toISOString();
      if (text) notes.push({ id, text, at });
    }
    // Sort by date descending (newest first)
    notes.sort((a, b) => b.at.localeCompare(a.at));
    patch.productionNotes = notes;
  }

  if (Array.isArray(body.progressNotes)) {
    const notes: ProgressNote[] = [];
    for (const raw of body.progressNotes) {
      const n = raw as ProgressNote;
      const status = String(n?.status ?? "");
      const text = typeof n?.text === "string" ? n.text.trim() : "";
      const at = typeof n?.at === "string" && n.at ? n.at : new Date().toISOString();
      const id = typeof n?.id === "string" && n.id ? n.id : crypto.randomUUID();
      if (status && flow.includes(status as OrderStatus) && text) {
        notes.push({ id, status: status as OrderStatus, text, at });
      }
    }
    patch.progressNotes = notes;
  }

  const updated = await updateOrder(code, patch);
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
  const order = await getOrder(code);
  if (order?.files?.length) {
    await deleteOrderFiles(order.files.map((f) => f.key));
  }
  await deleteOrder(code);
  return NextResponse.json({ ok: true });
}