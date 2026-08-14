/**
 * Minimal admin authentication.
 *
 * The admin password is configured through the ADMIN_PASSWORD environment
 * variable (set in the Netlify dashboard). Requests to protected endpoints
 * must carry it in the `Authorization: Bearer <password>` header, which the
 * admin UI sends on every call. This is intentionally simple — no users,
 * sessions or database — matching the "settings page" scope requested.
 */

import { timingSafeEqual } from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

/** Sanitizes a hash length so timing comparisons don't leak the length. */
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Returns true when the request carries a valid admin password. */
export function isAuthorized(authorization: string | null): boolean {
  if (!ADMIN_PASSWORD) return false;
  if (!authorization?.startsWith("Bearer ")) return false;
  const token = authorization.slice("Bearer ".length);
  return safeCompare(token, ADMIN_PASSWORD);
}