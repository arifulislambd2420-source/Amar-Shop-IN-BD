import { getDb } from "./db";
import type { User } from "./types";

export async function listUsers(limit = 50): Promise<User[]> {
  const db = await getDb();
  const [rows] = await db.query("SELECT id, name, phone, created_at FROM users ORDER BY created_at DESC LIMIT ?", [
    limit,
  ]);
  return rows as User[];
}

export async function countUsers(): Promise<number> {
  const db = await getDb();
  const [[{ c }]] = (await db.query("SELECT COUNT(*) c FROM users")) as [{ c: number }[], unknown];
  return c;
}
