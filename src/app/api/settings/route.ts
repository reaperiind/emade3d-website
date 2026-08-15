import { NextResponse } from "next/server";
import {
  getSettings,
  saveSettings,
  type SiteSettings,
} from "@/lib/settings-store";
import { isAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/settings — public. Returns the delivery config the order form and
// tracking page need (offices, fees, currency). No secrets here.
export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

// PUT /api/settings — admin only. Replaces the full settings object.
export async function PUT(request: Request) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as SiteSettings | null;
  if (!body || !body.delivery || !Array.isArray(body.delivery.offices)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  // Sanitize office entries.
  const sanitized: SiteSettings = {
    currency: String(body.currency ?? "DA").slice(0, 12) || "DA",
    delivery: {
      pickupAvailable: Boolean(body.delivery.pickupAvailable),
      pickupNote: String(body.delivery.pickupNote ?? "").slice(0, 300),
      homeFee: Number(body.delivery.homeFee) || 0,
      offices: body.delivery.offices
        .map((o) => ({
          id: String(o.id ?? crypto.randomUUID()).slice(0, 60),
          name: String(o.name ?? "").slice(0, 120),
          address: String(o.address ?? "").slice(0, 300),
          fee: Number(o.fee) || 0,
        }))
        .filter((o) => o.name),
    },
  };
  await saveSettings(sanitized);
  return NextResponse.json({ ok: true, settings: sanitized });
}