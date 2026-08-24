import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getDb } from "./db";
import { getSessionSecret } from "./session-secret";

const SESSION_COOKIE = "shop_admin_session";

export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const db = await getDb();
  const [rows] = await db.execute("SELECT password_hash FROM admin_users WHERE username = ?", [username]);
  const row = (rows as { password_hash: string }[])[0];
  if (!row) return false;
  return bcrypt.compare(password, row.password_hash);
}

export async function createSessionToken(username: string): Promise<string> {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured — cannot create a session.");
  }
  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSessionUsername(): Promise<string | null> {
  const secret = getSessionSecret();
  if (!secret) return null; // fail closed when ADMIN_SESSION_SECRET is unset in production
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload.username as string) || null;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE };
