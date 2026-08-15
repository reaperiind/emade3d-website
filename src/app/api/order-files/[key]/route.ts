import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin-auth";
import {
  deleteOrderFile,
  getOrderFile,
  sanitizeOrderFileKey,
} from "@/lib/order-files-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { key: string } };

// GET /api/order-files/:key — admin only, downloads a stored file.
export async function GET(request: Request, { params }: Ctx) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const key = sanitizeOrderFileKey(decodeURIComponent(params.key));
  if (!key) {
    return NextResponse.json({ error: "invalid_key" }, { status: 400 });
  }
  const file = await getOrderFile(key);
  if (!file) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return new NextResponse(file.data, {
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "Content-Length": String(file.data.byteLength),
    },
  });
}

// DELETE /api/order-files/:key — admin only, removes a stored file.
export async function DELETE(request: Request, { params }: Ctx) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const key = sanitizeOrderFileKey(decodeURIComponent(params.key));
  if (!key) {
    return NextResponse.json({ error: "invalid_key" }, { status: 400 });
  }
  const file = await getOrderFile(key);
  if (file) await deleteOrderFile(key);
  return NextResponse.json({ ok: true });
}