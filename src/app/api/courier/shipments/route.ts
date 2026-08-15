import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin-auth";
import { getOrder, updateOrder } from "@/lib/orders-store";
import { CourierError, createShipment } from "@/lib/courier";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/courier/shipments — admin only. Creates a Guepex parcel for an
 * existing order (cash-on-delivery) and stores the tracking number on the
 * order. Weight and (optional) dimensions are provided by the admin here.
 */
export async function POST(request: Request) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    code?: string;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    doInsurance?: boolean;
    declaredValue?: number;
  } | null;

  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!code) {
    return NextResponse.json({ error: "missing_code" }, { status: 400 });
  }

  const order = await getOrder(code);
  if (!order) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (order.shipment?.tracking) {
    return NextResponse.json(
      { error: "already_shipped", tracking: order.shipment.tracking },
      { status: 409 }
    );
  }

  let result;
  try {
    result = await createShipment({
      order,
      weight: Number(body?.weight) || 0,
      length: Number(body?.length) || 0,
      width: Number(body?.width) || 0,
      height: Number(body?.height) || 0,
      doInsurance: Boolean(body?.doInsurance),
      declaredValue: Number(body?.declaredValue) || 0,
    });
  } catch (e) {
    const message = e instanceof CourierError ? e.message : "shipment_failed";
    const status = e instanceof CourierError && e.status ? e.status : 502;
    return NextResponse.json({ error: message }, { status });
  }

  const shipment = {
    tracking: result.tracking,
    ...(result.id ? { id: result.id } : {}),
    createdAt: new Date().toISOString(),
  };
  const updated = await updateOrder(code, { shipment });
  return NextResponse.json({ ok: true, shipment, order: updated });
}