import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSettings } from "@/lib/settings";
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
    if (order.consignment_id) return NextResponse.json({ error: "Order is already sent to Steadfast" }, { status: 400 });

    const settings = await getSettings(["steadfast_api_key", "steadfast_secret_key"]);
    if (!settings.steadfast_api_key || !settings.steadfast_secret_key) {
      return NextResponse.json({ error: "Steadfast Courier API keys are not configured in settings." }, { status: 400 });
    }

    const payload = {
      invoice: order.id.toString(), // Alternatively order.invoice_no if you have it
      recipient_name: order.customer_name,
      recipient_phone: order.phone,
      recipient_address: `${order.address}, ${order.thana}, ${order.district}`,
      cod_amount: order.payment_method === "cod" ? order.total : 0,
      note: order.notes || "",
    };

    const res = await fetch("https://portal.steadfast.com.bd/api/v1/create_order", {
      method: "POST",
      headers: {
        "Api-Key": settings.steadfast_api_key,
        "Secret-Key": settings.steadfast_secret_key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.status !== 200) {
      throw new Error(data.message || "Failed to create parcel on Steadfast");
    }

    const consId = data.consignment?.consignment_id;
    const trackCode = data.consignment?.tracking_code;
    const courierStatus = data.consignment?.status || "pending";

    if (!consId || !trackCode) {
      throw new Error("Invalid response from Steadfast API");
    }

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
