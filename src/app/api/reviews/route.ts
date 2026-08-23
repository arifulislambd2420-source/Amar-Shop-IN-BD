import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { z } from "zod";

const reviewSchema = z.object({
  product_id: z.number(),
  customer_name: z.string().min(2, "Name must be at least 2 characters"),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = reviewSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    const { product_id, customer_name, rating, comment } = parsed.data;

    const db = await getDb();
    await db.execute(
      `INSERT INTO reviews (product_id, customer_name, rating, comment, approved) VALUES (?, ?, ?, ?, 0)`,
      [product_id, customer_name, rating, comment || null]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
