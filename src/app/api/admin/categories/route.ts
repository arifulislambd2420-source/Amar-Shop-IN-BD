import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUsername } from "@/lib/auth";
import { listCategories } from "@/lib/products";
import { createCategory } from "@/lib/categories";

const schema = z.object({
  name: z.string().min(1, "নাম দিন"),
  slug: z.string().optional(),
  icon: z.string().optional().nullable(),
});

export async function GET() {
  if (!(await getSessionUsername())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ categories: await listCategories() });
}

export async function POST(req: NextRequest) {
  if (!(await getSessionUsername())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  try {
    const id = await createCategory(parsed.data);
    return NextResponse.json({ id });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "সংরক্ষণ করা যায়নি" }, { status: 400 });
  }
}
