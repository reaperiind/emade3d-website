import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/auth — Verifies the admin password and grants a session token.
// The token is simply the admin password itself sent back (used as a Bearer
// header on subsequent calls), matching the minimal password-only scope.
export async function POST(request: Request) {
  const { password } = (await request.json().catch(() => ({ password: "" }))) as {
    password?: string;
  };
  if (isAuthorized(`Bearer ${password ?? ""}`)) {
    return NextResponse.json({ ok: true, token: password });
  }
  return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
}