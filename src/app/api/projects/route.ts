import { NextResponse } from "next/server";
import { getProjects, saveProjects } from "@/lib/projects-store";
import type { Project } from "@/data/projects";
import { isAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/projects — public. Returns the portfolio catalog as managed in
// the admin Galerie page.
export async function GET() {
  const projects = await getProjects();
  return NextResponse.json({ projects });
}

// PUT /api/projects — admin only. Replaces the whole catalog (ordering,
// categories and images are set by the admin Galerie page).
export async function PUT(request: Request) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as {
    projects?: Project[];
  } | null;
  const incoming = body?.projects;
  if (!Array.isArray(incoming)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const cleanProject = (p: Partial<Project>): Project | null => {
    const slug = String(p.slug ?? "").trim();
    const title =
      p.title && typeof p.title === "object"
        ? {
            fr: String(p.title.fr ?? "").slice(0, 200),
            en: String(p.title.en ?? "").slice(0, 200),
            ar: String(p.title.ar ?? "").slice(0, 200),
          }
        : { fr: "", en: "", ar: "" };
    const cat = String(p.category ?? "");
    const validCategories = [
      "impression-3d",
      "conception-3d",
      "prototypage",
      "pieces-mecaniques",
      "outillage",
      "moules",
      "fabrication-sur-mesure",
    ];
    if (!slug || !cat || !validCategories.includes(cat) || !title.fr) return null;
    const localizedField = (v: unknown) =>
      v && typeof v === "object"
        ? {
            fr: String((v as Record<string, unknown>).fr ?? "").slice(0, 2000),
            en: String((v as Record<string, unknown>).en ?? "").slice(0, 2000),
            ar: String((v as Record<string, unknown>).ar ?? "").slice(0, 2000),
          }
        : { fr: "", en: "", ar: "" };

    return {
      slug: slug.slice(0, 120),
      title,
      category: cat as Project["category"],
      summary: localizedField(p.summary),
      problem: localizedField(p.problem),
      solution: localizedField(p.solution),
      method: localizedField(p.method),
      result: localizedField(p.result),
      client: localizedField(p.client),
      duration: localizedField(p.duration),
      year: String(p.year ?? "").slice(0, 10),
      featured: Boolean(p.featured),
      ...(Array.isArray(p.images)
        ? { images: p.images.filter((k) => typeof k === "string").slice(0, 12) }
        : {}),
    };
  };

  const cleaned = incoming.map(cleanProject).filter((p): p is Project => p !== null);
  await saveProjects(cleaned);
  return NextResponse.json({ ok: true, projects: cleaned });
}