// Edge-safe (no node APIs) so both middleware.ts and auth.ts can share it.
//
// In production we NEVER fall back to a hardcoded secret: the repo is public,
// so a known constant would let anyone forge a valid admin JWT. If
// ADMIN_SESSION_SECRET is missing in production we return null and every caller
// fails closed (no token can be created or verified) until it is configured.
const DEV_FALLBACK = "dev-only-secret-change-me-in-production-0000";

export function getSessionSecret(): Uint8Array | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (s && s.length >= 16) return new TextEncoder().encode(s);
  if (process.env.NODE_ENV === "production") {
    console.error(
      "ADMIN_SESSION_SECRET is not set (or too short) — admin authentication is disabled until it is configured."
    );
    return null;
  }
  return new TextEncoder().encode(DEV_FALLBACK);
}
