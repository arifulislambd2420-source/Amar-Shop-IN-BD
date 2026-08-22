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
