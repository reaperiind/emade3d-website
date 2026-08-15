import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings-store";
import { CourierError, quoteDeliveryFee } from "@/lib/courier";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/courier/quote — public. Computes the delivery fee for a route:
 * - office: delivery to a courier center.
 * - home: delivery to a wilaya + commune.
 *
 * When the courier is configured & enabled, the price is fetched live from
 * Guepex with a short in-memory cache. Otherwise (or on failure) it falls
 * back to the manually configured office fee / home fee.
 */

const cache = new Map<string, { at: number; fee: number | null }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

interface QuoteBody {
  deliveryType?: "office" | "home";
  wilayaId?: number | string;
  communeId?: number | string;
  officeId?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as QuoteBody | null;
  const deliveryType = body?.deliveryType === "home" ? "home" : "office";
  const wilayaId = Number(body?.wilayaId) || 0;
  const communeId = Number(body?.communeId) || undefined;
  const officeId = typeof body?.officeId === "string" ? body.officeId : undefined;

  const settings = await getSettings();
  const courier = settings.delivery.courier;
  const courierOn = Boolean(
    courier?.enabled && courier.apiId && courier.apiToken && courier.fromWilayaId
  );

  // Fallback: manual settings.
  const fallback =
    deliveryType === "office"
      ? settings.delivery.offices.find((o) => o.id === officeId)?.fee ?? 0
      : settings.delivery.homeFee || 0;

  if (!courierOn) {
    return NextResponse.json({ fee: fallback, source: "settings" });
  }

  const cacheKey = `${deliveryType}:${wilayaId}:${communeId ?? 0}:${officeId ?? ""}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json({ fee: hit.fee, source: "courier" });
  }

  try {
    const fee = await quoteDeliveryFee({
      fromWilayaId: courier!.fromWilayaId as number,
      toWilayaId: wilayaId,
      communeId,
      deliveryType,
    });
    cache.set(cacheKey, { at: Date.now(), fee });
    return NextResponse.json({ fee, source: "courier" });
  } catch (e) {
    const message = e instanceof CourierError ? e.message : "quote_failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}