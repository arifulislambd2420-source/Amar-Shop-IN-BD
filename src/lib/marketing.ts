import { getDb } from "./db";
import type { FlashSale } from "./types";

export async function getActiveFlashSale(): Promise<FlashSale | null> {
  const db = await getDb();
  const [rows] = await db.query(
    "SELECT * FROM flash_sales WHERE is_active = 1 AND end_time > NOW() ORDER BY end_time ASC LIMIT 1"
  );
  const flashSale = (rows as any[])[0];

  if (!flashSale) {
    return null;
  }

  const [items] = await db.query(
    `SELECT fsi.*, p.name, p.price, p.sale_price, p.image_url, p.slug 
     FROM flash_sale_items fsi 
     JOIN products p ON fsi.product_id = p.id 
     WHERE fsi.flash_sale_id = ?`,
    [flashSale.id]
  );

  flashSale.items = items;
  return flashSale;
}
