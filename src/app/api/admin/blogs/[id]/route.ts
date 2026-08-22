import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUsername } from "@/lib/auth";
import { updateBlog, deleteBlog } from "@/lib/blogs";

const blogUpdateSchema = z.object({
  title: z.string().min(1, "শিরোনাম দিন").optional(),
  slug: z.string().min(1, "স্লাগ দিন").optional(),
  cover: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  content: z.string().min(1, "কন্টেন্ট দিন").optional(),
  read_time: z.number().int().positive().nullable().optional(),
  published_at: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = blogUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }
  try {
    await updateBlog(Number(id), parsed.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await deleteBlog(Number(id));
  return NextResponse.json({ success: true });
}
