import { getDb } from "./db";
import type { IpBlock } from "./types";

export async function listIpBlocks(): Promise<IpBlock[]> {
  const db = await getDb();
  const [rows] = await db.query("SELECT * FROM ip_blocks ORDER BY created_at DESC");
  return rows as IpBlock[];
}

export async function addIpBlock(ip: string, reason: string | null): Promise<number> {
  const db = await getDb();
  const [result] = await db.execute("INSERT INTO ip_blocks (ip, reason) VALUES (?, ?)", [ip, reason]);
  return (result as import("mysql2/promise").ResultSetHeader).insertId;
}

export async function removeIpBlock(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM ip_blocks WHERE id = ?", [id]);
}
