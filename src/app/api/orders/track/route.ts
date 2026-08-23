import { NextRequest, NextResponse } from "next/server";
import { trackOrder, getOrderItems } from "@/lib/orders";

export async function POST(req: NextRequest) {
  const { orderId, phone } = await req.json().catch(() => ({ orderId: "", phone: "" }));
  const result = await trackOrder(String(orderId || ""), String(phone || ""));
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  const order = result.order;

  // Attempt to sync status with Steadfast if we have a consignment_id
  if (order.consignment_id) {
    try {
      const { getSettings } = await import("@/lib/settings");
      const { getDb } = await import("@/lib/db");
      const settings = await getSettings(["steadfast_api_key", "steadfast_secret_key"]);
      
      if (settings.steadfast_api_key && settings.steadfast_secret_key) {
        const syncRes = await fetch(`https://portal.steadfast.com.bd/api/v1/status_by_cid/${order.consignment_id}`, {
          headers: {
            "Api-Key": settings.steadfast_api_key,
            "Secret-Key": settings.steadfast_secret_key,
          },
          // Some fetch requests might be cached by Next.js if we don't disable it
          cache: "no-store"
        });
        
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          const currentCourierStatus = syncData.delivery_status || syncData.status;
          
          if (currentCourierStatus && currentCourierStatus !== order.courier_status) {
            let newStatus = order.status;
            const statusLower = currentCourierStatus.toLowerCase();
            
            if (statusLower.includes("delivered")) {
              newStatus = "delivered";
            } else if (statusLower.includes("shipped") || statusLower.includes("in_transit") || statusLower.includes("out for delivery")) {
              newStatus = "shipped";
            }
            
            if (newStatus !== order.status || currentCourierStatus !== order.courier_status) {
              const db = await getDb();
              await db.execute(
                "UPDATE orders SET courier_status = ?, status = ? WHERE id = ?",
                [currentCourierStatus, newStatus, order.id]
              );
              order.courier_status = currentCourierStatus;
              order.status = newStatus;
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to sync steadfast status", err);
    }
  }

  return NextResponse.json({ order, items: await getOrderItems(order.id) });
}
