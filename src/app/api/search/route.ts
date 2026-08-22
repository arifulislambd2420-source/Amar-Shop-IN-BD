import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/products";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ products: [] });
  try {
    const products = await searchProducts(q, 8);
    return NextResponse.json({ products });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "সার্চ করা যায়নি" }, { status: 500 });
  }
}
