import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyCustomerCredentials, createCustomerSessionToken, setCustomerSessionCookie } from "@/lib/customer-auth";

const bodySchema = z.object({
  phone: z.string().min(1, "ফোন নম্বর দিন"),
  password: z.string().min(1, "Password দিন"),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }
  const { phone, password } = parsed.data;
  const session = await verifyCustomerCredentials(phone, password);
  if (!session) {
    return NextResponse.json({ error: "Phone অথবা Password ভুল" }, { status: 401 });
  }
  const token = await createCustomerSessionToken(session);
  await setCustomerSessionCookie(token);
  return NextResponse.json(session);
}
