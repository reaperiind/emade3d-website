import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/settings-store";
import { parseDeliveryFile } from "@/lib/delivery-import";
import { isAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const maxDuration = 30;

// POST /api/delivery/import — admin only, multipart form upload.
// Body: file: the .xlsx / .xls / .csv to import.
// Merges wilayas, communes and optionally offices into the saved settings.
export async function POST(request: Request) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    file = form.get("file") as File | null;
  } catch {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }
  const bytes = await file.arrayBuffer();

  let parsed;
  try {
    parsed = parseDeliveryFile(bytes);
  } catch {
    return NextResponse.json(
      { error: "Impossible de lire le fichier. Utilisez un fichier Excel (.xlsx/.xls) ou CSV valide." },
      { status: 400 }
    );
  }

  const settings = await getSettings();
  const next = { ...settings.delivery };

  // Merge wilayas by id (imported data wins; existing home fees are kept when
  // the imported row has no fee).
  const mergedWilayas = new Map<number, (typeof next.wilayas)[number]>();
  for (const w of next.wilayas) mergedWilayas.set(w.id, w);
  for (const w of parsed.wilayas) {
    const existing = mergedWilayas.get(w.id);
    mergedWilayas.set(w.id, {
      id: w.id,
      name: w.name,
      nameAr: w.nameAr || existing?.nameAr,
      homeFee: w.homeFee > 0 ? w.homeFee : existing?.homeFee ?? 0,
      ...(w.stopDeskFee != null
        ? { stopDeskFee: w.stopDeskFee }
        : existing?.stopDeskFee != null
          ? { stopDeskFee: existing.stopDeskFee }
          : {}),
    });
  }
  next.wilayas = Array.from(mergedWilayas.values());

  // Merge communes by id.
  const mergedCommunes = new Map<number, (typeof next.communes)[number]>();
  for (const c of next.communes) mergedCommunes.set(c.id, c);
  for (const c of parsed.communes) {
    mergedCommunes.set(c.id, {
      id: c.id,
      wilayaId: c.wilayaId,
      name: c.name,
      nameAr: c.nameAr || mergedCommunes.get(c.id)?.nameAr,
    });
  }
  next.communes = Array.from(mergedCommunes.values());

  if (parsed.offices) {
    const mergedOffices = new Map<string, (typeof next.offices)[number]>();
    for (const o of next.offices) mergedOffices.set(o.id, o);
    for (const o of parsed.offices) mergedOffices.set(o.id, o);
    next.offices = Array.from(mergedOffices.values());
  }

  await saveSettings({ ...settings, delivery: next });

  return NextResponse.json({
    ok: true,
    counts: {
      wilayas: parsed.wilayas.length,
      communes: parsed.communes.length,
      offices: parsed.offices?.length ?? 0,
    },
    total: {
      wilayas: next.wilayas.length,
      communes: next.communes.length,
      offices: next.offices.length,
    },
    log: parsed.log,
  });
}