import { NextResponse } from "next/server";
import { getSessionUsername } from "@/lib/auth";
import { dashboardStats, listOrders } from "@/lib/orders";

export async function GET() {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const stats = dashboardStats();
  const latestOrders = listOrders(10);
  return NextResponse.json({ stats, latestOrders });
}
