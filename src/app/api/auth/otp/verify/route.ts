import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyOTP } from "@/lib/sms";
import { getDb } from "@/lib/db";
import { createCustomerSessionToken, setCustomerSessionCookie } from "@/lib/customer-auth";
import bcrypt from "bcryptjs";

const schema = z.object({
  phone: z.string().min(11, "সঠিক ফোন নম্বর দিন"),
  otp: z.string().min(4, "OTP দিন"),
  name: z.string().optional(), // Provided if registering
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { phone, otp, name } = parsed.data;

    if (!verifyOTP(phone, otp)) {
      return NextResponse.json({ error: "OTP ভুল অথবা মেয়াদ উত্তীর্ণ" }, { status: 400 });
    }

    const db = await getDb();
    const normalized = (phone || "").replace(/[^0-9]/g, "");

    const [rows] = await db.execute("SELECT id, name, phone FROM users WHERE phone = ?", [normalized]);
    let user = (rows as any[])[0];

    if (!user) {
      if (!name) {
        return NextResponse.json({ requireRegistration: true, message: "একাউন্ট নেই, নাম দিন" });
      }
      // Create user with a dummy password since they use OTP
      const dummyHash = await bcrypt.hash(Math.random().toString(), 10);
      const [result] = await db.execute(
        "INSERT INTO users (name, phone, password_hash) VALUES (?, ?, ?)",
        [name, normalized, dummyHash]
      );
      user = { id: (result as any).insertId, name, phone: normalized };
    }

    const token = await createCustomerSessionToken(user);
    await setCustomerSessionCookie(token);

    return NextResponse.json(user);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
