import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUsername } from "@/lib/auth";
import { getSetting, setSetting } from "@/lib/settings";

// খালি রাখলে GTM বন্ধ, নাহলে GTM-XXXXXXX ফরম্যাট মানতে হবে।
const gtmSchema = z.object({
  gtm_id: z
    .string()
    .trim()
    .refine((v) => v === "" || /^GTM-[A-Z0-9]{4,}$/.test(v), "সঠিক GTM ID দিন (যেমন GTM-XXXXXXX) অথবা খালি রাখুন"),
});

export async function GET() {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const gtm_id = (await getSetting("gtm_id")) || "";
  return NextResponse.json({ gtm_id });
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = gtmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  try {
    await setSetting("gtm_id", parsed.data.gtm_id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "সংরক্ষণ করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
