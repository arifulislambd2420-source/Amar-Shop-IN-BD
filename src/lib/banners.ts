import mysql from "mysql2/promise";
import { getDb } from "./db";
import type { Banner } from "./types";

export async function getBanners(position: "hero" | "side" | "promo"): Promise<Banner[]> {
  const db = await getDb();
  const [rows] = await db.execute(
    "SELECT * FROM banners WHERE position = ? AND active = 1 ORDER BY sort_order ASC",
    [position]
  );
  return rows as Banner[];
}

export async function listAllBanners(): Promise<Banner[]> {
  const db = await getDb();
  const [rows] = await db.query("SELECT * FROM banners ORDER BY position, sort_order ASC");
  return rows as Banner[];
}

export async function createBanner(input: {
  image: string;
  link: string | null;
  position: string;
  sort_order: number;
  active: number;
}): Promise<number> {
  const db = await getDb();
  const [result] = await db.execute(
    "INSERT INTO banners (image, link, position, sort_order, active) VALUES (?, ?, ?, ?, ?)",
    [input.image, input.link, input.position, input.sort_order, input.active]
  );
  return (result as mysql.ResultSetHeader).insertId;
}

export async function getBannerById(id: number): Promise<Banner | undefined> {
  const db = await getDb();
  const [rows] = await db.execute("SELECT * FROM banners WHERE id = ?", [id]);
  return (rows as Banner[])[0];
}

export async function updateBanner(
  id: number,
  input: Partial<{
    image: string;
    link: string | null;
    position: string;
    sort_order: number;
    active: number;
  }>
): Promise<void> {
  const db = await getDb();
  const current = await getBannerById(id);
  if (!current) throw new Error("Banner not found");
  const merged = { ...current, ...input };
  await db.execute(
    "UPDATE banners SET image=?, link=?, position=?, sort_order=?, active=? WHERE id=?",
    [merged.image, merged.link, merged.position, merged.sort_order, merged.active, id]
  );
}

export async function deleteBanner(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM banners WHERE id = ?", [id]);
}
