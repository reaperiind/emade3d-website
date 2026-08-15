import { NextResponse } from "next/server";
import { testConnection } from "@/lib/courier";
import { isAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/courier/test — admin only. Tests the Guepex connection using the
// credentials submitted (typed but possibly unsaved) or the stored ones.
export async function POST(request: Request) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as {
    apiId?: string;
    apiToken?: string;
  } | null;

  const result = await testConnection({
    apiId: typeof body?.apiId === "string" ? body.apiId : undefined,
    apiToken: typeof body?.apiToken === "string" ? body.apiToken : undefined,
  });

  return NextResponse.json(result);
}