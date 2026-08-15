import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/delivery/quote — public. Computes the delivery fee from the
 * manually configured catalogs:
 * - office: the office's configured fee.
 * - home: the destination wilaya's home fee, falling back to the global
 *   home fee when no per-wilaya fee is set.
 * No external API is consulted.
 */

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
  const officeId = typeof body?.officeId === "string" ? body.officeId : undefined;

  const settings = await getSettings();

  let fee: number;
  let source: string;

  if (deliveryType === "office") {
    fee = settings.delivery.offices.find((o) => o.id === officeId)?.fee ?? 0;
    source = "office";
  } else {
    const wilaya =
      wilayaId > 0
        ? settings.delivery.wilayas.find((w) => w.id === wilayaId)
        : undefined;
    fee = wilaya?.homeFee ?? settings.delivery.homeFee;
    source = "wilaya";
  }

  return NextResponse.json({ fee, source });
}