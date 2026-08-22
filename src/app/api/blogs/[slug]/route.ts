import { NextRequest, NextResponse } from "next/server";
import { getBlogBySlug } from "@/lib/blogs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const blog = await getBlogBySlug(slug);
    if (!blog) return NextResponse.json({ error: "ব্লগ পাওয়া যায়নি" }, { status: 404 });
    return NextResponse.json({ blog });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "ব্লগ লোড করা যায়নি" }, { status: 500 });
  }
}
