import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAndStoreOTP, sendSMS } from "@/lib/sms";
import { getDb } from "@/lib/db";

const schema = z.object({
  phone: z.string().min(11, "সঠিক ফোন নম্বর দিন"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { phone } = parsed.data;
    
    // Check if user exists. We don't block sending OTP, but it's good to know.
    const db = await getDb();
    const [rows] = await db.execute("SELECT id FROM users WHERE phone = ?", [phone.replace(/[^0-9]/g, "")]);
    const exists = !!(rows as any[])[0];

    // Generate and send OTP
    const otp = generateAndStoreOTP(phone);
    await sendSMS(phone, `Your AmarShop verification code is: ${otp}. It will expire in 5 minutes.`);

    return NextResponse.json({ success: true, exists });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
