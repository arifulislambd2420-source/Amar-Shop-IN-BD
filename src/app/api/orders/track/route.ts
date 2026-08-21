import { NextRequest, NextResponse } from "next/server";
import { trackOrder, getOrderItems } from "@/lib/orders";

export async function POST(req: NextRequest) {
  const { orderId, phone } = await req.json().catch(() => ({ orderId: "", phone: "" }));
  const result = await trackOrder(String(orderId || ""), String(phone || ""));
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
  return NextResponse.json({ order: result.order, items: await getOrderItems(result.order.id) });
}
