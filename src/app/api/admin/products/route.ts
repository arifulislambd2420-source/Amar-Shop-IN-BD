import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUsername } from "@/lib/auth";
import { listProducts, createProduct, listCategories } from "@/lib/products";

const productSchema = z.object({
  name: z.string().min(1, "প্রোডাক্টের নাম দিন"),
  description: z.string().optional(),
  price: z.number().positive("দাম অবশ্যই ০ এর বেশি হতে হবে"),
  sale_price: z.number().positive().nullable().optional(),
  image: z.string().optional(),
  category_id: z.number().int().nullable().optional(),
  stock: z.number().int("স্টক অবশ্যই পূর্ণসংখ্যা হতে হবে").min(0, "স্টক ঋণাত্মক হতে পারবে না"),
});

export async function GET() {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ products: listProducts(), categories: listCategories() });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const id = createProduct({
    name: data.name,
    description: data.description || "",
    price: data.price,
    sale_price: data.sale_price ?? null,
    image: data.image || "/products/placeholder.svg",
    category_id: data.category_id ?? null,
    stock: data.stock ?? 0,
  });
  return NextResponse.json({ id });
}
