import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { Coupon } from "@/lib/types";

export async function GET(_req: NextRequest) {
  try {
    const db = await getDb();
    const [rows] = await db.query("SELECT * FROM coupons ORDER BY id DESC");
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, discount_type, discount_value, min_spend, max_uses, valid_until, is_active } = body;

    const db = await getDb();
    const [res]: any = await db.execute(
      `INSERT INTO coupons (code, discount_type, discount_value, min_spend, max_uses, valid_until, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code, discount_type, discount_value, min_spend || 0, max_uses || null, valid_until || null, is_active ? 1 : 0]
    );

    return NextResponse.json({ id: res.insertId, ...body });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
