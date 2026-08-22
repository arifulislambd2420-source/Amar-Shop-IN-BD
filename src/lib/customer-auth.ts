import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { getDb } from "./db";

const SESSION_COOKIE = "customer_session";
const SECRET = new TextEncoder().encode(
  process.env.CUSTOMER_SESSION_SECRET || "dev-only-secret-change-me-in-production-0000"
);

export type CustomerSession = { id: number; name: string; phone: string };

function normPhone(raw: string) {
  return (raw || "").replace(/[^0-9]/g, "");
}

export async function registerCustomer(
  name: string,
  phone: string,
  password: string
): Promise<CustomerSession> {
  const db = await getDb();
  const normalized = normPhone(phone);

  const [existingRows] = await db.execute("SELECT id FROM users WHERE phone = ?", [normalized]);
  if ((existingRows as { id: number }[])[0]) {
    throw new Error("এই ফোন নম্বর দিয়ে ইতিমধ্যে একাউন্ট আছে");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await db.execute(
    "INSERT INTO users (name, phone, password_hash) VALUES (?, ?, ?)",
    [name, normalized, passwordHash]
  );
  const id = (result as mysql.ResultSetHeader).insertId;
  return { id, name, phone: normalized };
}

export async function verifyCustomerCredentials(
  phone: string,
  password: string
): Promise<CustomerSession | null> {
  const db = await getDb();
  const normalized = normPhone(phone);
  const [rows] = await db.execute(
    "SELECT id, name, phone, password_hash FROM users WHERE phone = ?",
    [normalized]
  );
  const row = (rows as { id: number; name: string; phone: string; password_hash: string }[])[0];
  if (!row) return null;
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return null;
  return { id: row.id, name: row.name, phone: row.phone };
}

export async function createCustomerSessionToken(session: CustomerSession): Promise<string> {
  return new SignJWT({ id: session.id, phone: session.phone, name: session.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function setCustomerSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCustomerSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (!payload.id || !payload.phone) return null;
    return {
      id: payload.id as number,
      name: (payload.name as string) || "",
      phone: payload.phone as string,
    };
  } catch {
    return null;
  }
}

export { SESSION_COOKIE as CUSTOMER_SESSION_COOKIE };
