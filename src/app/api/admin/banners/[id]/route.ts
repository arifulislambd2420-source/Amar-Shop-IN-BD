import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUsername } from "@/lib/auth";
import { updateBanner, deleteBanner } from "@/lib/banners";

const bannerUpdateSchema = z.object({
  image: z.string().min(1, "ইমেজ দিন").optional(),
  link: z.string().nullable().optional(),
  position: z.enum(["hero", "side", "promo"]).optional(),
  sort_order: z.number().int("সর্ট অর্ডার পূর্ণসংখ্যা হতে হবে").min(0, "সর্ট অর্ডার ঋণাত্মক হতে পারবে না").optional(),
  active: z.number().int().min(0).max(1).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = bannerUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }
  try {
    await updateBanner(Number(id), parsed.data);
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
  await deleteBanner(Number(id));
  return NextResponse.json({ success: true });
}
