import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json().catch(() => ({ username: "", password: "" }));
  if (!username || !password) {
    return NextResponse.json({ error: "Username ও Password দিন" }, { status: 400 });
  }
  const ok = await verifyAdminCredentials(username, password);
  if (!ok) {
    return NextResponse.json({ error: "ভুল Username অথবা Password" }, { status: 401 });
  }
  const token = await createSessionToken(username);
  await setSessionCookie(token);
  return NextResponse.json({ success: true });
}
