import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUsername } from "@/lib/auth";
import { bulkUpdateProducts, PRODUCT_STATUSES } from "@/lib/products";

const bulkSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, "কোনো পণ্য নির্বাচন করা হয়নি"),
  action: z.enum(["set_status", "trash", "price_adjust"]),
  payload: z
    .object({
      status: z.enum(PRODUCT_STATUSES).optional(),
      mode: z.enum(["fixed", "percent"]).optional(),
      amount: z.number().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }
  try {
    const affected = await bulkUpdateProducts(
      parsed.data.ids,
      parsed.data.action,
      parsed.data.payload || {}
    );
    return NextResponse.json({ success: true, affected });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bulk update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
