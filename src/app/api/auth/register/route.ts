import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { registerCustomer, createCustomerSessionToken, setCustomerSessionCookie } from "@/lib/customer-auth";

const bodySchema = z.object({
  name: z.string().min(1, "নাম দিন"),
  phone: z
    .string()
    .regex(/^0?1[0-9]{9,10}$/, "সঠিক ফোন নম্বর দিন (01XXXXXXXXX)"),
  password: z.string().min(6, "Password কমপক্ষে ৬ অক্ষরের হতে হবে"),
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
    const { name, phone, password } = parsed.data;
    const session = await registerCustomer(name, phone, password);
    const token = await createCustomerSessionToken(session);
    await setCustomerSessionCookie(token);
    return NextResponse.json(session);
  } catch (err) {
    const message = err instanceof Error ? err.message : "রেজিস্ট্রেশন সম্পন্ন করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
