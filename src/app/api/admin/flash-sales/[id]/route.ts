import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUsername } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSessionUsername())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, end_time, is_active, items } = body;

    const db = await getDb();
    const conn = await db.getConnection();
    
    try {
      await conn.beginTransaction();

      await conn.execute(
        `UPDATE flash_sales SET title = ?, end_time = ?, is_active = ? WHERE id = ?`,
        [title, new Date(end_time).toISOString(), is_active ? 1 : 0, parseInt(id, 10)]
      );

      // Re-insert items
      await conn.execute(`DELETE FROM flash_sale_items WHERE flash_sale_id = ?`, [parseInt(id, 10)]);

      if (items && Array.isArray(items)) {
        for (const item of items) {
          await conn.execute(
            `INSERT INTO flash_sale_items (flash_sale_id, product_id, flash_price) VALUES (?, ?, ?)`,
            [parseInt(id, 10), item.product_id, item.flash_price]
          );
        }
      }

      await conn.commit();
      return NextResponse.json({ success: true });
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSessionUsername())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const db = await getDb();
    await db.execute("DELETE FROM flash_sales WHERE id = ?", [parseInt(id, 10)]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
