import { NextResponse } from "next/server";
import {
  getSettings,
  saveSettings,
  sanitizeSettings,
  type SiteSettings,
  type CourierConfig,
} from "@/lib/settings-store";
import { isAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/settings — public. Returns the delivery config the order form and
// tracking page need (offices, wilayas, communes, fees, currency). The courier
// API id/token are stripped out by sanitizeSettings().
export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ settings: sanitizeSettings(settings) });
}

// PUT /api/settings — admin only. Replaces the settings object, preserving the
// courier secret when the admin submits a blank token / id (the public GET
// never sends them back).
export async function PUT(request: Request) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as Partial<SiteSettings> | null;
  if (!body || !body.delivery || !Array.isArray(body.delivery.offices)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const existing = await getSettings();
  const incoming = body.delivery;

  // Preserve courier credentials when the admin leaves them blank.
  let courier = existing.delivery.courier;
  if (incoming.courier) {
    const c = incoming.courier as Partial<CourierConfig>;
    const hasId = typeof c.apiId === "string" && c.apiId.trim() !== "";
    const hasToken = typeof c.apiToken === "string" && c.apiToken.trim() !== "";
    const source = existing.delivery.courier ?? {
      provider: "guepex",
      name: "Guepex",
      apiId: "",
      apiToken: "",
      enabled: false,
      fromWilayaId: null,
      lastImportedAt: undefined,
    };
    courier = {
      provider: "guepex",
      name:
        typeof c.name === "string" && c.name.trim()
          ? String(c.name).trim().slice(0, 60)
          : "Guepex",
      apiId: hasId ? String(c.apiId).trim().slice(0, 120) : source.apiId,
      apiToken: hasToken ? String(c.apiToken).trim().slice(0, 200) : source.apiToken,
      enabled: c.enabled === true || c.enabled === undefined ? source.enabled : false,
      fromWilayaId:
        Number.isFinite(Number(c.fromWilayaId)) && Number(c.fromWilayaId) > 0
          ? Number(c.fromWilayaId)
          : source.fromWilayaId,
      lastImportedAt:
        typeof c.lastImportedAt === "string" ? c.lastImportedAt : source.lastImportedAt,
    };
    // If the courier block was removed entirely (undefined), keep existing unless
    // explicitly flagged; here courier is kept when provided. A null courier is
    // not a valid removal signal in this UI.
  }
  // Keep imported catalogs when not resubmitted (offices array is required).

  const sanitized: SiteSettings = {
    currency: String(body.currency ?? existing.currency ?? "DA").slice(0, 12) || "DA",
    delivery: {
      pickupAvailable: Boolean(
        incoming.pickupAvailable === undefined
          ? existing.delivery.pickupAvailable
          : incoming.pickupAvailable
      ),
      pickupNote: String(
        incoming.pickupNote ?? existing.delivery.pickupNote ?? ""
      ).slice(0, 300),
      homeFee: Number(
        incoming.homeFee ?? existing.delivery.homeFee
      ) || 0,
      offices: incoming.offices
        .map((o) => ({
          id: String(o.id ?? crypto.randomUUID()).slice(0, 60),
          name: String(o.name ?? "").slice(0, 120),
          address: String(o.address ?? "").slice(0, 300),
          fee: Number(o.fee) || 0,
          ...(o.centerId ? { centerId: String(o.centerId).slice(0, 60) } : {}),
        }))
        .filter((o) => o.name),
      ...(courier ? { courier } : {}),
      ...(Array.isArray(incoming.wilayas) ? { wilayas: incoming.wilayas } : {}),
      ...(Array.isArray(incoming.communes) ? { communes: incoming.communes } : {}),
    },
  };

  await saveSettings(sanitized);
  return NextResponse.json({ ok: true, settings: sanitizeSettings(sanitized) });
}