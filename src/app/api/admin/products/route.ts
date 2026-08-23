import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUsername } from "@/lib/auth";
import {
  createProduct,
  listCategories,
  listBrands,
  listProductsAdmin,
  PRODUCT_STATUSES,
} from "@/lib/products";

const productSchema = z.object({
  name: z.string().min(1, "প্রোডাক্টের নাম দিন"),
  description: z.string().optional(),
  price: z.number().positive("দাম অবশ্যই ০ এর বেশি হতে হবে"),
  sale_price: z.number().positive().nullable().optional(),
  image: z.string().optional(),
  category_id: z.number().int().nullable().optional(),
  brand_id: z.number().int().nullable().optional(),
  stock: z.number().int("স্টক অবশ্যই পূর্ণসংখ্যা হতে হবে").min(0, "স্টক ঋণাত্মক হতে পারবে না"),
  sku: z.string().max(64).nullable().optional(),
  status: z.enum(PRODUCT_STATUSES).optional(),
  cost_price: z.number().min(0).nullable().optional(),
  seo_title: z.string().max(255).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional(),
  tags: z.string().max(500).nullable().optional(),
});

export async function GET(req: NextRequest) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const num = (v: string | null) => (v && !Number.isNaN(Number(v)) ? Number(v) : undefined);
  const stockParam = sp.get("stock");
  const { rows, total } = await listProductsAdmin({
    q: sp.get("q") || undefined,
    categoryId: num(sp.get("categoryId")),
    brandId: num(sp.get("brandId")),
    status: sp.get("status") || undefined,
    stock: stockParam === "in" || stockParam === "out" ? stockParam : undefined,
    trashed: sp.get("trashed") === "1",
    page: num(sp.get("page")) || 1,
    pageSize: num(sp.get("pageSize")) || 20,
  });
  return NextResponse.json({
    products: rows,
    total,
    categories: await listCategories(),
    brands: await listBrands(),
  });
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
  try {
    const id = await createProduct({
      name: data.name,
      description: data.description || "",
      price: data.price,
      sale_price: data.sale_price ?? null,
      image: data.image || "/products/placeholder.svg",
      category_id: data.category_id ?? null,
      brand_id: data.brand_id ?? null,
      stock: data.stock ?? 0,
      sku: data.sku ?? null,
      status: data.status,
      cost_price: data.cost_price ?? null,
      seo_title: data.seo_title ?? null,
      meta_description: data.meta_description ?? null,
      tags: data.tags ?? null,
    });
    return NextResponse.json({ id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
