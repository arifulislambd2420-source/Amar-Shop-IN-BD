import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { Coupon } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { code, cartSubtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "কোড দিন" }, { status: 400 });
    }

    const db = await getDb();
    const [rows] = await db.query("SELECT * FROM coupons WHERE code = ? AND is_active = 1", [code]);
    const coupon = (rows as Coupon[])[0];

    if (!coupon) {
      return NextResponse.json({ error: "কুপন কোডটি সঠিক নয় অথবা ইনঅ্যাক্টিভ" }, { status: 404 });
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return NextResponse.json({ error: "কুপনটির মেয়াদ শেষ হয়ে গেছে" }, { status: 400 });
    }

    if (coupon.max_uses !== null && coupon.uses >= coupon.max_uses) {
      return NextResponse.json({ error: "কুপনটির ব্যবহারের সীমা শেষ" }, { status: 400 });
    }

    if (cartSubtotal < coupon.min_spend) {
      return NextResponse.json({ error: `এই কুপনটি ব্যবহার করতে অন্তত ৳${coupon.min_spend} টাকার কেনাকাটা করতে হবে` }, { status: 400 });
    }

    let discountAmount = 0;
    if (coupon.discount_type === "percent") {
      discountAmount = (cartSubtotal * coupon.discount_value) / 100;
    } else {
      discountAmount = coupon.discount_value;
    }

    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, cartSubtotal);

    return NextResponse.json({
      success: true,
      coupon_id: coupon.id,
      code: coupon.code,
      discount_amount: discountAmount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
