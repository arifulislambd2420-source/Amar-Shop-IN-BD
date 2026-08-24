import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUsername } from "@/lib/auth";

export async function GET(_req: NextRequest) {
  if (!(await getSessionUsername())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = await getDb();
    const [rows] = await db.query("SELECT * FROM flash_sales ORDER BY id DESC");
    const flashSales: any[] = rows as any[];

    // Fetch items for each flash sale
    for (const fs of flashSales) {
      const [items] = await db.query(
        "SELECT fsi.*, p.name as product_name FROM flash_sale_items fsi JOIN products p ON fsi.product_id = p.id WHERE fsi.flash_sale_id = ?",
        [fs.id]
      );
      fs.items = items;
    }

    return NextResponse.json(flashSales);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await getSessionUsername())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { title, end_time, is_active, items } = body;

    const db = await getDb();
    const conn = await db.getConnection();
    
    try {
      await conn.beginTransaction();

      const [res]: any = await conn.execute(
        `INSERT INTO flash_sales (title, end_time, is_active) VALUES (?, ?, ?)`,
        [title, new Date(end_time).toISOString(), is_active ? 1 : 0]
      );
      const fsId = res.insertId;

      if (items && Array.isArray(items)) {
        for (const item of items) {
          await conn.execute(
            `INSERT INTO flash_sale_items (flash_sale_id, product_id, flash_price) VALUES (?, ?, ?)`,
            [fsId, item.product_id, item.flash_price]
          );
        }
      }

      await conn.commit();
      return NextResponse.json({ success: true, id: fsId });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
