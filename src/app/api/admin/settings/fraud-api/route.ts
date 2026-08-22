import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUsername } from "@/lib/auth";
import { listFraudConfigs, upsertFraudConfig } from "@/lib/fraud-config";

const fraudConfigSchema = z.object({
  type: z.enum(["free", "paid"]),
  api_url: z.string().min(1, "API URL দিন"),
  api_key: z.string().min(1, "API Key দিন"),
  active: z.number().int().min(0).max(1),
});

const API_KEY_PLACEHOLDER = "********";

export async function GET() {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const configs = await listFraudConfigs();
  const masked = configs.map((c) => ({
    ...c,
    api_key: c.api_key ? API_KEY_PLACEHOLDER : "",
  }));
  return NextResponse.json({ configs: masked });
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = fraudConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }
  try {
    if (parsed.data.api_key === API_KEY_PLACEHOLDER) {
      const existing = (await listFraudConfigs()).find((c) => c.type === parsed.data.type);
      if (existing) {
        await upsertFraudConfig({ ...parsed.data, api_key: existing.api_key });
      } else {
        return NextResponse.json({ error: "API Key দিন" }, { status: 400 });
      }
    } else {
      await upsertFraudConfig(parsed.data);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "সংরক্ষণ করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
