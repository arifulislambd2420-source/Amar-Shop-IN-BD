import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUsername } from "@/lib/auth";
import { getSettings, setSetting } from "@/lib/settings";

const SMTP_KEYS = [
  "mail_mailer",
  "mail_host",
  "mail_port",
  "mail_username",
  "mail_password",
  "mail_encryption",
  "mail_from_address",
  "mail_from_name",
];

const smtpSchema = z.object({
  mail_mailer: z.string().min(1),
  mail_host: z.string().min(1),
  mail_port: z.number().int().min(1).max(65535),
  mail_username: z.string().optional().default(""),
  mail_password: z.string().optional().default(""),
  mail_encryption: z.enum(["ssl", "tls"]),
  mail_from_address: z.string().email("সঠিক Email দিন"),
  mail_from_name: z.string().min(1),
});

const PASSWORD_PLACEHOLDER = "********";

export async function GET() {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getSettings(SMTP_KEYS);
  return NextResponse.json({
    settings: {
      ...settings,
      mail_password: settings.mail_password ? PASSWORD_PLACEHOLDER : "",
    },
  });
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = smtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }
  const data = parsed.data;
  try {
    await setSetting("mail_mailer", data.mail_mailer);
    await setSetting("mail_host", data.mail_host);
    await setSetting("mail_port", String(data.mail_port));
    await setSetting("mail_username", data.mail_username);
    if (data.mail_password && data.mail_password !== PASSWORD_PLACEHOLDER) {
      await setSetting("mail_password", data.mail_password);
    }
    await setSetting("mail_encryption", data.mail_encryption);
    await setSetting("mail_from_address", data.mail_from_address);
    await setSetting("mail_from_name", data.mail_from_name);
  } catch (err) {
    const message = err instanceof Error ? err.message : "সংরক্ষণ করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
