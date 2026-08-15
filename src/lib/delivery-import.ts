/**
 * Parses an uploaded Excel / CSV delivery file into the site's delivery
 * catalogs (wilayas, communes, offices). Handles a first sheet, or sheets
 * named "wilayas", "communes", "offices" (or French / Arabic equivalents).
 *
 * Column headers are detected by name synonyms, so files authored in
 * French, Arabic, or English are accepted without a fixed template.
 */

import * as XLSX from "xlsx";
import type { Commune, Office, Wilaya } from "@/lib/settings-store";

export interface DeliveryImport {
  wilayas: Wilaya[];
  communes: Commune[];
  offices: Office[] | null;
  /** Human readable summary of what was parsed. */
  log: string[];
}

type Row = string[];

const TRIM = (v: unknown): string => (v == null ? "" : String(v).trim());

const norm = (s: string) =>
  s
    .toLowerCase()
    // Remove non-alphanumeric letters marks, spaces, separators.
    .replace(/[\u0300-\u036f\u00a0\s_-]+/g, "")
    .replace(/[éèêë]/g, "e")
    .replace(/[àâä]/g, "a")
    .replace(/[ïî]/g, "i")
    .replace(/[öô]/g, "o")
    .replace(/[ûüù]/g, "u")
    .replace(/[ç]/g, "c")
    .replace(/'/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");

const toId = (v: string): number | null => {
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
};

const toFee = (v: string): number | null => {
  const s = String(v).replace(/\u00a0/g, " ").replace(/,/g, ".").trim();
  if (!s) return null;
  const n = Number(s.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const HEADER = {
  name: ["nom", "name", "wilaya", "commune", "désignation", "designation",
    "destination"],
  nameAr: ["nomar", "namear", "nomarabe", "sarabe", "nomar", "arabe",
    "wilayaar", "communear", "الاسمبالعربية", "arabic"],
  id: ["id", "code", "num", "number", "officeid", "matricule"],
  wilayaId: ["wilayaid", "idwilaya", "wilayacode", "codewilaya", "wilaya_id",
    "codewilaya"],
  wilayaName: ["wilaya", "nomwilaya", "الولاية", "destination"],
  communeName: ["commune", "communename", "بلدية", "البلدية"],
  fee: ["fee", "frais", "prix", "tarif", "livraison", "delivery", "cout",
    "سعر", "سعرالتوصيل", "tariff", "homedelivery", "homedeliveryfee", "prixdelivraison",
    "tarifadomicile", "tarifadomicileda", "tarif à domicile", "domicile"],
  stopDeskFee: ["stop-desk", "stopdesk", "tarifstopdesk", "tarifstopdeskda",
    "tarif stop-desk", "tarifstopdeskfee", "bareme", "bureau", "stopdeskfee"],
  address: ["adresse", "address", "rue", "عنوان", "site", "position"],
} as const;

type HeaderKey = keyof typeof HEADER;

const ALL_SYNONYMS = new Set<string>(
  Object.values(HEADER).flatMap((group) =>
    (group as readonly string[]).map((k) => norm(k))
  )
);

/** Column index (in `row`) whose cell matches one of the synonyms, or -1. */
function headerCol(row: Row, group: readonly string[]): number {
  for (let i = 0; i < row.length; i++) {
    if ((group as readonly string[]).some((k) => norm(row[i]) === norm(k)))
      return i;
  }
  return -1;
}

/** Builds a map HeaderKey → column index for a header row. -1 = absent. */
function buildMap(header: Row): Record<HeaderKey, number> {
  const map = {} as Record<HeaderKey, number>;
  for (const key of Object.keys(HEADER) as HeaderKey[]) {
    map[key] = headerCol(header, HEADER[key]);
  }
  return map;
}

/** Finds the row index that contains recognizable headers. */
function findHeaderStart(rows: Row[]): number {
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].some((cell) => ALL_SYNONYMS.has(norm(cell)))) return i;
  }
  return -1;
}

function detectSheetType(header: Row): "wilayas" | "communes" | "offices" | null {
  const hasCommune = headerCol(header, HEADER.communeName) >= 0;
  const hasWilaya =
    headerCol(header, HEADER.wilayaName) >= 0 ||
    headerCol(header, HEADER.wilayaId) >= 0;
  const hasName = headerCol(header, HEADER.name) >= 0;
  const hasAddress = headerCol(header, HEADER.address) >= 0;

  if (hasCommune) return "communes";
  // A wilaya table has a name but no address; an office table usually has one.
  if (hasName && !hasAddress) return "wilayas";
  if (hasName && hasAddress) return "offices";
  if (hasWilaya && headerCol(header, HEADER.id) >= 0) return "communes";
  if (hasWilaya) return "communes";
  return null;
}

function pick(
  row: Row,
  colMap: Record<HeaderKey, number>,
  key: HeaderKey
): string {
  const i = colMap[key];
  return i >= 0 && i < row.length ? TRIM(row[i]) : "";
}

function parseWilayas(rows: Row[], colMap: Record<HeaderKey, number>): Wilaya[] {
  const out: Wilaya[] = [];
  const byId = new Map<number, number>();
  let autoId = 1;
  for (const r of rows) {
    let name = pick(r, colMap, "name") || pick(r, colMap, "wilayaName");
    if (!name) continue;
    // Support the "01- Adrar" / "01 Adrar" destination format.
    const destMatch = name.match(/^(\d{1,3})\s*[-–—:]?\s*(.+)$/);
    let id = toId(pick(r, colMap, "id")) ?? toId(pick(r, colMap, "wilayaId"));
    if ((id === null || id <= 0) && destMatch) id = Number(destMatch[1]);
    if (id === null || id <= 0) {
      // Auto-assign the next free id.
      while (byId.has(autoId)) autoId++;
      id = autoId;
    }
    if (byId.has(id)) continue;
    if (destMatch) name = destMatch[2].trim();
    const fee = toFee(pick(r, colMap, "fee"));
    const stopDeskFee = toFee(pick(r, colMap, "stopDeskFee"));
    byId.set(id, id);
    out.push({
      id,
      name,
      homeFee: fee ?? 0,
      ...(stopDeskFee != null ? { stopDeskFee } : {}),
      nameAr: pick(r, colMap, "nameAr") || undefined,
    });
  }
  return out;
}

function parseCommunes(
  rows: Row[],
  colMap: Record<HeaderKey, number>,
  wilayas: Wilaya[]
): Commune[] {
  const out: Commune[] = [];
  const byId = new Set<number>();
  const wilayaByName = new Map(wilayas.map((w) => [norm(w.name), w.id]));
  const freeWilayaId = (): number => {
    const used = new Set(wilayas.map((w) => w.id));
    let id = 1;
    while (used.has(id)) id++;
    return id;
  };
  let counter = 1;
  const nextCommuneId = (wilayaId: number) => wilayaId * 10000 + counter++;

  for (const r of rows) {
    const name = pick(r, colMap, "communeName") || pick(r, colMap, "name");
    if (!name) continue;
    let wilayaId: number | null | undefined = toId(pick(r, colMap, "wilayaId"));
    if (wilayaId === null || wilayaId === undefined) {
      const wName = pick(r, colMap, "wilayaName");
      wilayaId = wilayaByName.get(norm(wName)) as number | undefined;
    }
    if (wilayaId === null || wilayaId === undefined || Number.isNaN(wilayaId)) {
      // Attach to a synthetic wilaya named after the row's wilaya column.
      const wName = pick(r, colMap, "wilayaName");
      if (wName) {
        let w = wilayas.find((x) => norm(x.name) === norm(wName));
        if (!w) {
          w = { id: freeWilayaId(), name: wName, homeFee: 0 };
          wilayas.push(w);
          wilayaByName.set(norm(wName), w.id);
        }
        const fee = toFee(pick(r, colMap, "fee"));
        if (fee !== null) w.homeFee = fee;
        wilayaId = w.id;
      } else {
        continue; // no way to attach the commune
      }
    } else {
      // Known wilaya: pick up the fee from this row if present.
      const fee = toFee(pick(r, colMap, "fee"));
      if (fee !== null) {
        const w = wilayas.find((x) => x.id === wilayaId);
        if (w) w.homeFee = fee;
      }
    }
    const finalId = wilayaId as number;

    let id = toId(pick(r, colMap, "id"));
    if (id === null || id === undefined || id <= 0) id = nextCommuneId(finalId);
    while (byId.has(id)) id = nextCommuneId(finalId);
    byId.add(id);

    out.push({
      id,
      wilayaId: finalId,
      name,
      nameAr: pick(r, colMap, "nameAr") || undefined,
    });
  }
  return out;
}

function parseOffices(rows: Row[], colMap: Record<HeaderKey, number>): Office[] {
  let n = 1;
  return rows
    .map((r) => {
      const name = pick(r, colMap, "name");
      if (!name) return null;
      const fee = toFee(pick(r, colMap, "fee")) ?? 0;
      return {
        id: pick(r, colMap, "id") || `office-${n++}`,
        name,
        address: pick(r, colMap, "address") || "",
        fee,
      } as Office;
    })
    .filter((o): o is Office => o !== null);
}

export function parseDeliveryFile(buffer: ArrayBuffer): DeliveryImport {
  const wb = XLSX.read(buffer, { type: "array" });
  const log: string[] = [];
  let wilayas: Wilaya[] = [];
  let communes: Commune[] = [];
  let offices: Office[] | null = null;

  for (const sheetName of wb.SheetNames) {
    const rawRows = XLSX.utils.sheet_to_json<Row>(wb.Sheets[sheetName], {
      defval: "",
      header: 1,
    }).map((r) => (r as Row).map(TRIM));
    if (!rawRows.length) continue;

    const start = findHeaderStart(rawRows);
    if (start < 0) continue;
    const colMap = buildMap(rawRows[start]);
    const data = rawRows
      .slice(start + 1)
      .filter((r) => r.some((cell) => cell !== ""));

    const s = norm(sheetName);
    const raw = sheetName.toLowerCase();
    const type =
      s.includes("wilaya") || s.includes("usaniy") || raw.includes("ولاية")
        ? "wilayas"
        : s.includes("commune") || s.includes("baladia") || raw.includes("بلدية")
          ? "communes"
          : s.includes("office") || s.includes("bureau") || s.includes("maktab") ||
              raw.includes("مكتب")
            ? "offices"
            : detectSheetType(rawRows[start]);

    if (type === "wilayas") {
      const parsed = parseWilayas(data, colMap);
      // Merge within the file: later sheets override, but keep a present fee
      // when the new row has none (so an empty "Comparaison" sheet never
      // clobbers the Économique values).
      const merged = new Map<number, Wilaya>();
      for (const w of wilayas) merged.set(w.id, w);
      for (const w of parsed) {
        const prev = merged.get(w.id);
        merged.set(w.id, {
          id: w.id,
          name: w.name,
          nameAr: w.nameAr || prev?.nameAr,
          homeFee: w.homeFee > 0 ? w.homeFee : prev?.homeFee ?? 0,
          ...(w.stopDeskFee != null
            ? { stopDeskFee: w.stopDeskFee }
            : prev?.stopDeskFee != null
              ? { stopDeskFee: prev.stopDeskFee }
              : {}),
        });
      }
      const before = wilayas.length;
      wilayas = Array.from(merged.values());
      log.push(
        `Wilayas : ${parsed.length} ligne(s) (${wilayas.length - before ? `${wilayas.length - before} nouvelle(s)` : "fusionnées"}).`
      );
    } else if (type === "communes") {
      const parsed = parseCommunes(data, colMap, wilayas);
      const before = new Set(communes.map((c) => c.id));
      for (const c of parsed) if (!before.has(c.id)) communes.push(c);
      log.push(`Communes : ${parsed.length} ligne(s) lues.`);
    } else if (type === "offices") {
      offices = parseOffices(data, colMap);
      log.push(`Bureaux : ${offices.length} ligne(s) lues.`);
    }
  }

  if (!wilayas.length && !communes.length && !offices && log.length === 0) {
    log.push("Aucune donnée exploitable trouvée dans le fichier.");
  }

  return { wilayas, communes, offices, log };
}