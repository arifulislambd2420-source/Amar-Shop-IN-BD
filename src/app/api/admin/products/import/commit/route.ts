import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUsername } from "@/lib/auth";
import { commitImport } from "@/lib/product-io";

const schema = z.object({
  csv: z.string().min(1, "CSV ফাইল খালি"),
  mapping: z.record(z.string(), z.string()),
  mode: z.enum(["create_only", "update_only", "both", "dry_run"]),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }
  try {
    const result = await commitImport(parsed.data.csv, parsed.data.mapping, parsed.data.mode);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "ইমপোর্ট ব্যর্থ হয়েছে" }, { status: 400 });
  }
}
