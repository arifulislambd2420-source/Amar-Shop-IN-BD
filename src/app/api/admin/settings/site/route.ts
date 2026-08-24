import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUsername } from "@/lib/auth";
import { getSettings, setSetting } from "@/lib/settings";

const SITE_KEYS = ["site_logo", "site_name"];

const schema = z.object({
  site_logo: z.string().optional().nullable(),
  site_name: z.string().optional().nullable(),
});

export async function GET() {
  if (!(await getSessionUsername())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getSettings(SITE_KEYS);
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  if (!(await getSessionUsername())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  try {
    if (parsed.data.site_logo !== undefined) await setSetting("site_logo", parsed.data.site_logo || "");
    if (parsed.data.site_name !== undefined) await setSetting("site_name", parsed.data.site_name || "");
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "সংরক্ষণ করা যায়নি" }, { status: 400 });
  }
}
