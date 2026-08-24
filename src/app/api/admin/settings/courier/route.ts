import { NextResponse } from "next/server";
import { getSettings, setSetting } from "@/lib/settings";
import { getSessionUsername } from "@/lib/auth";

export async function GET() {
  if (!(await getSessionUsername())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getSettings(["steadfast_api_key", "steadfast_secret_key"]);
  // Mask the secret key for security
  return NextResponse.json({
    steadfast_api_key: settings.steadfast_api_key || "",
    steadfast_secret_key: settings.steadfast_secret_key ? "********" : "",
  });
}

export async function PUT(req: Request) {
  if (!(await getSessionUsername())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { steadfast_api_key, steadfast_secret_key } = await req.json();

    if (steadfast_api_key !== undefined) {
      await setSetting("steadfast_api_key", steadfast_api_key);
    }
    
    // Only update secret key if it's not the masked string
    if (steadfast_secret_key !== undefined && steadfast_secret_key !== "********") {
      await setSetting("steadfast_secret_key", steadfast_secret_key);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
