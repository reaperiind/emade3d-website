import { NextResponse } from "next/server";
import { getMedia, deleteMedia, sanitizeMediaKey } from "@/lib/media-store";
import { isAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/media/[key] — public. Serves a stored project image.
export async function GET(
  _: Request,
  { params }: { params: { key: string } }
) {
  const key = sanitizeMediaKey(params.key);
  if (!key) {
    return NextResponse.json({ error: "invalid_key" }, { status: 400 });
  }
  const media = await getMedia(key);
  if (!media) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return new Response(media.data, {
    headers: {
      "Content-Type": media.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

// DELETE /api/media/[key] — admin only.
export async function DELETE(
  request: Request,
  { params }: { params: { key: string } }
) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const key = sanitizeMediaKey(params.key);
  if (!key) {
    return NextResponse.json({ error: "invalid_key" }, { status: 400 });
  }
  await deleteMedia(key);
  return NextResponse.json({ ok: true });
}