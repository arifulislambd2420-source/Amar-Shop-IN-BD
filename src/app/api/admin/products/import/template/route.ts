import { NextResponse } from "next/server";
import { getSessionUsername } from "@/lib/auth";
import { sampleTemplateCsv } from "@/lib/product-io";

export async function GET() {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return new NextResponse(sampleTemplateCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="products-import-template.csv"',
    },
  });
}
