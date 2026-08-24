import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { orderToken, method, status } = await req.json();
    if (!orderToken) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const db = await getDb();
    
    // Find order
    const [rows] = await db.query("SELECT id FROM orders WHERE order_token = ?", [orderToken]);
    const order = (rows as any[])[0];
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Determine the payment status based on the method
    let finalStatus = status || 'paid';
    if (method === 'advance' && finalStatus === 'paid') {
      finalStatus = 'advance_paid';
    }

    // Update payment status
    await db.execute(
      "UPDATE orders SET payment_status = ?, payment_method = ? WHERE id = ?",
      [finalStatus, method, order.id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update payment status" }, { status: 500 });
  }
}
