import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUsername } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSessionUsername())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const { code, discount_type, discount_value, min_spend, max_uses, valid_until, is_active } = body;

    const db = await getDb();
    await db.execute(
      `UPDATE coupons SET code = ?, discount_type = ?, discount_value = ?, min_spend = ?, max_uses = ?, valid_until = ?, is_active = ? WHERE id = ?`,
      [code, discount_type, discount_value, min_spend || 0, max_uses || null, valid_until || null, is_active ? 1 : 0, parseInt(id, 10)]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSessionUsername())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const db = await getDb();
    await db.execute("DELETE FROM coupons WHERE id = ?", [parseInt(id, 10)]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
