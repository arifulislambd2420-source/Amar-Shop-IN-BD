import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createContactMessage } from "@/lib/contact";

const bodySchema = z.object({
  name: z.string().min(1, "নাম দিন"),
  phone: z.string().min(1, "ফোন নম্বর দিন"),
  email: z.string().email("সঠিক ইমেইল দিন"),
  subject: z.string().min(1, "বিষয় দিন"),
  message: z.string().min(1, "মেসেজ দিন"),
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
    await createContactMessage(parsed.data);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "মেসেজ পাঠানো যায়নি" }, { status: 500 });
  }
}
