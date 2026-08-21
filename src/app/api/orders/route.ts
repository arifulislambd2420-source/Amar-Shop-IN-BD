import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrder } from "@/lib/orders";

const bodySchema = z.object({
  customer_name: z.string().min(1, "নাম দিন"),
  phone: z
    .string()
    .regex(/^0?1[0-9]{9,10}$/, "সঠিক ফোন নম্বর দিন (01XXXXXXXXX)"),
  email: z.string().email().optional().or(z.literal("")),
  district: z.string().min(1, "জেলা নির্বাচন করুন"),
  thana: z.string().min(1, "থানা দিন"),
  postcode: z.string().optional(),
  address: z.string().min(3, "বিস্তারিত ঠিকানা দিন"),
  notes: z.string().optional(),
  items: z
    .array(z.object({ productId: z.number(), quantity: z.number().min(1) }))
    .min(1, "কার্ট খালি"),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    const { orderId, orderToken } = await createOrder(parsed.data);
    return NextResponse.json({ orderId, orderToken });
  } catch (err) {
    const message = err instanceof Error ? err.message : "অর্ডার তৈরি করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
