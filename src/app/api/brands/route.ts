import { NextResponse } from "next/server";
import { listBrands } from "@/lib/products";

export async function GET() {
  try {
    const brands = await listBrands();
    return NextResponse.json({ brands });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "ব্র্যান্ড লোড করা যায়নি" }, { status: 500 });
  }
}
