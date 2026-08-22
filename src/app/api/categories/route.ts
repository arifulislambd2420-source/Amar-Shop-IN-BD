import { NextResponse } from "next/server";
import { listCategories } from "@/lib/products";

export async function GET() {
  try {
    const categories = await listCategories();
    return NextResponse.json({ categories });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "ক্যাটাগরি লোড করা যায়নি" }, { status: 500 });
  }
}
