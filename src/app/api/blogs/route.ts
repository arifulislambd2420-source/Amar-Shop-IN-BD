import { NextResponse } from "next/server";
import { listBlogs } from "@/lib/blogs";

export async function GET() {
  try {
    const blogs = await listBlogs();
    return NextResponse.json({ blogs });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "ব্লগ লোড করা যায়নি" }, { status: 500 });
  }
}
