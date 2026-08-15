import { NextResponse } from "next/server";
import {
  putMedia,
  makeMediaKey,
} from "@/lib/media-store";
import { isAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/media — admin only. Accepts multipart form data with one or more
// `file` parts and returns their generated keys. Images are then referenced on
// projects via the returned keys.
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