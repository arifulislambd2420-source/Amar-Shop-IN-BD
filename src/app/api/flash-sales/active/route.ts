import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    const db = await getDb();
    const [rows] = await db.query(
      "SELECT * FROM flash_sales WHERE is_active = 1 AND end_time > NOW() ORDER BY end_time ASC LIMIT 1"
    );
    const flashSale = (rows as any[])[0];

    if (!flashSale) {
      return NextResponse.json(null);
    }

    const [items] = await db.query(
      `SELECT fsi.*, p.name, p.price, p.sale_price, p.image_url, p.slug 
       FROM flash_sale_items fsi 
       JOIN products p ON fsi.product_id = p.id 
       WHERE fsi.flash_sale_id = ?`,
      [flashSale.id]
    );

    flashSale.items = items;
    return NextResponse.json(flashSale);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
