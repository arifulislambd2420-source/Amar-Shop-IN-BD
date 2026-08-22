import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUsername } from "@/lib/auth";
import { listAllBlogs, createBlog } from "@/lib/blogs";

const blogSchema = z.object({
  title: z.string().min(1, "শিরোনাম দিন"),
  slug: z.string().min(1, "স্লাগ দিন"),
  cover: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  content: z.string().min(1, "কন্টেন্ট দিন"),
  read_time: z.number().int().positive().nullable().optional(),
  published_at: z.string().optional(),
});

export async function GET() {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ blogs: await listAllBlogs() });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = blogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }
  const data = parsed.data;
  try {
    const id = await createBlog({
      title: data.title,
      slug: data.slug,
      cover: data.cover || null,
      category: data.category || null,
      content: data.content,
      read_time: data.read_time ?? null,
      published_at: data.published_at || new Date().toISOString().slice(0, 19).replace("T", " "),
    });
    return NextResponse.json({ id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "সংরক্ষণ করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
