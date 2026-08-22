import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUsername } from "@/lib/auth";
import { listAllBanners, createBanner } from "@/lib/banners";

const bannerSchema = z.object({
  image: z.string().min(1, "ইমেজ দিন"),
  link: z.string().nullable().optional(),
  position: z.enum(["hero", "side", "promo"]),
  sort_order: z.number().int("সর্ট অর্ডার পূর্ণসংখ্যা হতে হবে").min(0, "সর্ট অর্ডার ঋণাত্মক হতে পারবে না"),
  active: z.number().int().min(0).max(1).optional(),
});

export async function GET() {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ banners: await listAllBanners() });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = bannerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }
  const data = parsed.data;
  try {
    const id = await createBanner({
      image: data.image,
      link: data.link || null,
      position: data.position,
      sort_order: data.sort_order,
      active: data.active ?? 1,
    });
    return NextResponse.json({ id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "সংরক্ষণ করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
