import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUsername } from "@/lib/auth";
import { listIpBlocks, addIpBlock } from "@/lib/ip-block";

const IPV4_OR_IPV6 = /^([0-9]{1,3}\.){3}[0-9]{1,3}$|^[0-9a-fA-F:]+:[0-9a-fA-F:]*$/;

const ipBlockSchema = z.object({
  ip: z.string().regex(IPV4_OR_IPV6, "সঠিক IP address দিন"),
  reason: z.string().nullable().optional(),
});

export async function GET() {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ blocks: await listIpBlocks() });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = ipBlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }
  try {
    const id = await addIpBlock(parsed.data.ip, parsed.data.reason || null);
    return NextResponse.json({ id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "সংরক্ষণ করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
