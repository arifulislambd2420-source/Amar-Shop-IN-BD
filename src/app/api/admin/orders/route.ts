import { NextResponse } from "next/server";
import { getSessionUsername } from "@/lib/auth";
import { listOrders } from "@/lib/orders";

export async function GET() {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ orders: listOrders(200) });
}
