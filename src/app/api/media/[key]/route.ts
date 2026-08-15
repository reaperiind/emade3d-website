import { NextResponse } from "next/server";
import {
  getMedia,
  putMedia,
  deleteMedia,
  makeMediaKey,
  sanitizeMediaKey,
} from "@/lib/media-store";
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

// POST /api/media — admin only. Accepts multipart form data with one or more
// `file` parts and returns their generated keys.
export async function POST(request: Request) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const files = form
    .getAll("file")
    .filter((v): v is File => v instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }

  const keys: string[] = [];
  for (const file of files) {
    const key = makeMediaKey(file.name);
    await putMedia(key, file, file.type || undefined);
    keys.push(key);
  }
  return NextResponse.json({ ok: true, keys });
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