import { NextResponse } from "next/server";
import {
  getSettings,
  saveSettings,
  type SiteSettings,
  type Wilaya,
  type Commune,
  type Office,
} from "@/lib/settings-store";
import { isAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/settings — public. Returns the delivery config the order form and
// tracking page need (offices, wilayas, communes, fees, currency).
export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

// PUT /api/settings — admin only. Replaces the settings object (delivery
// catalogs are entered manually or imported from Excel).
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

  const cleanWilaya = (w: Partial<Wilaya>): Wilaya | null => {
    const id = Number(w.id);
    const name = String(w.name ?? "").trim().slice(0, 120);
    if (!Number.isFinite(id) || id <= 0 || !name) return null;
    return {
      id,
      name,
      ...(w.nameAr ? { nameAr: String(w.nameAr).slice(0, 120) } : {}),
      homeFee: Math.max(0, Number(w.homeFee) || 0),
      ...(w.stopDeskFee != null && Number(w.stopDeskFee) > 0
        ? { stopDeskFee: Number(w.stopDeskFee) }
        : {}),
    };
  };

  const cleanCommune = (c: Partial<Commune>): Commune | null => {
    const id = Number(c.id);
    const wilayaId = Number(c.wilayaId);
    const name = String(c.name ?? "").trim().slice(0, 120);
    if (!Number.isFinite(id) || id <= 0 || !name) return null;
    return {
      id,
      wilayaId: Number.isFinite(wilayaId) && wilayaId > 0 ? wilayaId : 0,
      name,
      ...(c.nameAr ? { nameAr: String(c.nameAr).slice(0, 120) } : {}),
    };
  };

  const cleanOffice = (o: Partial<Office>): Office | null => {
    const name = String(o.name ?? "").trim().slice(0, 120);
    if (!name) return null;
    return {
      id: String(o.id ?? crypto.randomUUID()).slice(0, 60),
      name,
      address: String(o.address ?? "").slice(0, 300),
      fee: Math.max(0, Number(o.fee) || 0),
    };
  };

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
      homeFee: Math.max(0, Number(incoming.homeFee ?? existing.delivery.homeFee) || 0),
      offices: (incoming.offices ?? [])
        .map(cleanOffice)
        .filter((o): o is Office => o !== null),
      wilayas: Array.isArray(incoming.wilayas)
        ? incoming.wilayas.map(cleanWilaya).filter((w): w is Wilaya => w !== null)
        : existing.delivery.wilayas,
      communes: Array.isArray(incoming.communes)
        ? incoming.communes.map(cleanCommune).filter((c): c is Commune => c !== null)
        : existing.delivery.communes,
    },
  };

  await saveSettings(sanitized);
  return NextResponse.json({ ok: true, settings: sanitized });
}