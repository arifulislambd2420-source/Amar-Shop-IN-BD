import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUsername } from "@/lib/auth";
import { getProductVariants, createProductVariant } from "@/lib/products";

const variantSchema = z.object({
  label: z.string().min(1, "লেবেল আবশ্যক"),
  price: z.number().positive("দাম অবশ্যই ০ এর বেশি হতে হবে"),
  stock: z.number().int("স্টক অবশ্যই পূর্ণসংখ্যা হতে হবে").min(0, "স্টক ঋণাত্মক হতে পারবে না"),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  return NextResponse.json({ variants: await getProductVariants(Number(id)) });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = variantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }
  const variantId = await createProductVariant({
    product_id: Number(id),
    label: parsed.data.label,
    price: parsed.data.price,
    stock: parsed.data.stock,
  });
  return NextResponse.json({ id: variantId });
}
