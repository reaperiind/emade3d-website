import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin-auth";
import { getSettings, saveSettings } from "@/lib/settings-store";
import { CourierError, importDeliveryData } from "@/lib/courier";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/courier/import — admin only. Pulls wilayas, communes and delivery
// centers from Guepex and stores them in the site settings (local mirror), so
// the order form and the pricing logic keep working if the API is down.
export async function POST(request: Request) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let result;
  try {
    result = await importDeliveryData();
  } catch (e) {
    const message = e instanceof CourierError ? e.message : "import_failed";
    const status = e instanceof CourierError && e.status ? e.status : 502;
    return NextResponse.json({ error: message }, { status });
  }

  if (
    result.wilayas.length === 0 &&
    result.communes.length === 0 &&
    result.centers.length === 0
  ) {
    return NextResponse.json({ error: "empty_import" }, { status: 502 });
  }

  const settings = await getSettings();
  const updated = {
    ...settings,
    delivery: {
      ...settings.delivery,
      ...(result.centers.length > 0
        ? { offices: result.centers }
        : { offices: settings.delivery.offices }),
      ...(result.wilayas.length > 0 ? { wilayas: result.wilayas } : {}),
      ...(result.communes.length > 0 ? { communes: result.communes } : {}),
      courier: {
        provider: settings.delivery.courier?.provider ?? "guepex",
        name: settings.delivery.courier?.name ?? "Guepex",
        apiId: settings.delivery.courier?.apiId ?? "",
        apiToken: settings.delivery.courier?.apiToken ?? "",
        enabled: settings.delivery.courier?.enabled ?? false,
        fromWilayaId: settings.delivery.courier?.fromWilayaId ?? null,
        lastImportedAt: new Date().toISOString(),
      },
    },
  };

  await saveSettings(updated);
  return NextResponse.json({
    ok: true,
    counts: {
      wilayas: result.wilayas.length,
      communes: result.communes.length,
      centers: result.centers.length,
    },
    importedAt: updated.delivery.courier.lastImportedAt,
  });
}