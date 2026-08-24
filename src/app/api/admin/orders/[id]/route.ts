import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUsername } from "@/lib/auth";
import { updateOrderStatus, updateOrderWithItems, getOrderByIdUnsafe, getOrderItems } from "@/lib/orders";
import type { OrderStatus } from "@/lib/types";

const VALID_STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "out_for_delivery", "delivered", "completed", "cancelled"];

const orderUpdateSchema = z.object({
  customer_name: z.string().min(1, "নাম আবশ্যক"),
  phone: z.string().min(1, "ফোন নম্বর আবশ্যক"),
  address: z.string().min(1, "ঠিকানা আবশ্যক"),
  shipping_fee: z.number().min(0),
  discount: z.number().min(0),
  payment_method: z.string().optional(),
  payment_status: z.string().optional(),
  items: z
    .array(
      z.object({
        product_id: z.number().int().nullable(),
        product_name: z.string().min(1),
        unit_price: z.number().min(0),
        quantity: z.number().int().positive(),
        discount: z.number().min(0),
      })
    )
    .min(1, "অন্তত একটি পণ্য থাকতে হবে"),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const order = await getOrderByIdUnsafe(Number(id));
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order, items: await getOrderItems(order.id) });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { status } = await req.json().catch(() => ({ status: "" }));
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  await updateOrderStatus(Number(id), status);
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = orderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }
  try {
    await updateOrderWithItems(Number(id), parsed.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
