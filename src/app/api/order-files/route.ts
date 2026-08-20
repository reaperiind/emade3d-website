import { NextResponse } from "next/server";
import {
  MAX_FILES_PER_ORDER,
  MAX_FILE_BYTES,
  contentTypeFor,
  makeOrderFileKey,
  putOrderFile,
} from "@/lib/order-files-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_EXT_RE =
  /\.(stl|obj|step|stp|iges|igs|3mf|sldprt|pdf|zip|png|jpg|jpeg|webp|gif)$/i;

// POST /api/order-files — public, uploads the design files attached to an
// order. Validates extension + size, stores each as a blob and returns the
// generated keys so the order can reference them.
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const files = form.getAll("files").filter((f): f is File =>
    f instanceof File && typeof f.name === "string"
  );
  if (files.length === 0) {
    return NextResponse.json({ error: "no_files" }, { status: 400 });
  }
  if (files.length > MAX_FILES_PER_ORDER) {
    return NextResponse.json(
      { error: "too_many_files", max: MAX_FILES_PER_ORDER },
      { status: 400 }
    );
  }

  const uploaded: { key: string; name: string; size: number }[] = [];
  for (const file of files) {
    if (!ALLOWED_EXT_RE.test(file.name)) {
      return NextResponse.json(
        { error: "invalid_extension", name: file.name },
        { status: 415 }
      );
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        {
          error: "file_too_large",
          name: file.name,
          maxBytes: MAX_FILE_BYTES,
        },
        { status: 413 }
      );
    }
    const key = makeOrderFileKey(file.name);
    const bytes = await file.arrayBuffer();
    await putOrderFile(key, bytes, file.name, contentTypeFor(key));
    uploaded.push({ key, name: file.name, size: file.size });
  }

  return NextResponse.json({ ok: true, files: uploaded }, { status: 201 });
}