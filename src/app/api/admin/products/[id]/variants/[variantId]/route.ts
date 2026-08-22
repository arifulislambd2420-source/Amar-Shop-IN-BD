import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUsername } from "@/lib/auth";
import { updateProductVariant, deleteProductVariant } from "@/lib/products";

const variantUpdateSchema = z.object({
  label: z.string().min(1, "লেবেল আবশ্যক").optional(),
  price: z.number().positive("দাম অবশ্যই ০ এর বেশি হতে হবে").optional(),
  stock: z.number().int("স্টক অবশ্যই পূর্ণসংখ্যা হতে হবে").min(0, "স্টক ঋণাত্মক হতে পারবে না").optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, variantId } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = variantUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }
  try {
    await updateProductVariant(Number(id), Number(variantId), parsed.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, variantId } = await params;
  await deleteProductVariant(Number(id), Number(variantId));
  return NextResponse.json({ success: true });
}
