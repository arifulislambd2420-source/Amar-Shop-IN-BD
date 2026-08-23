import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUsername } from "@/lib/auth";
import { updateProduct, trashProduct, deleteProductPermanent, PRODUCT_STATUSES } from "@/lib/products";

const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive("দাম অবশ্যই ০ এর বেশি হতে হবে").optional(),
  sale_price: z.number().positive().nullable().optional(),
  image: z.string().optional(),
  category_id: z.number().int().nullable().optional(),
  brand_id: z.number().int().nullable().optional(),
  stock: z.number().int("স্টক অবশ্যই পূর্ণসংখ্যা হতে হবে").min(0, "স্টক ঋণাত্মক হতে পারবে না").optional(),
  is_active: z.number().int().min(0).max(1).optional(),
  sku: z.string().max(64).nullable().optional(),
  status: z.enum(PRODUCT_STATUSES).optional(),
  cost_price: z.number().min(0).nullable().optional(),
  seo_title: z.string().max(255).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional(),
  tags: z.string().max(500).nullable().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }
  try {
    await updateProduct(Number(id), parsed.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}

// Default: soft-delete (trash). With ?permanent=1: hard-delete, but only if the
// product is already in the trash.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    if (req.nextUrl.searchParams.get("permanent") === "1") {
      await deleteProductPermanent(Number(id));
    } else {
      await trashProduct(Number(id));
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
