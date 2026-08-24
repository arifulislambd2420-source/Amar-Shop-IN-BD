import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUsername } from "@/lib/auth";
import type { Order } from "@/lib/types";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSessionUsername())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const db = await getDb();
    const [rows] = await db.execute("SELECT * FROM orders WHERE id = ?", [orderId]);
    const order = (rows as Order[])[0];

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.consignment_id) return NextResponse.json({ error: "Order is already sent to courier" }, { status: 400 });

    // Mock API integration for RedX
    // In a real application, you would make an API request to RedX's endpoints here.
    
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const consId = `REDX-${order.id}-${Math.floor(Math.random() * 10000)}`;
    const trackCode = `TRK-RX-${order.id}`;
    const courierStatus = "pending";

    // Save tracking info back to our database
    await db.execute(
      "UPDATE orders SET consignment_id = ?, tracking_code = ?, courier_status = ?, status = 'processing' WHERE id = ?",
      [consId, trackCode, courierStatus, orderId]
    );

    return NextResponse.json({ success: true, consignment_id: consId, tracking_code: trackCode });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
