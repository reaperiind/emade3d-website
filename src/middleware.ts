import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

/**
 * Locale routing without a locale prefix is redirected to the default locale
 * (French). All real pages live under /fr, /en, /ar.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The admin area is not localized.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.next();
  }

  const hasLocale = locales.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );

  if (hasLocale) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Exclude Next.js internals, API routes, admin and static files.
  matcher: ["/((?!_next|api|admin|.*\\..*).*)"],
};