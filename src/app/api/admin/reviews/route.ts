import { NextResponse } from "next/server";
import { getSessionUsername } from "@/lib/auth";
import { listReviewsWithProduct } from "@/lib/reviews";

export async function GET() {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ reviews: await listReviewsWithProduct() });
}
