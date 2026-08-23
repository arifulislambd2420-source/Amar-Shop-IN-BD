import { NextRequest, NextResponse } from "next/server";
import { getSessionUsername } from "@/lib/auth";
import { exportProductsCsv } from "@/lib/product-io";

export async function GET(req: NextRequest) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const num = (v: string | null) => (v && !Number.isNaN(Number(v)) ? Number(v) : undefined);
  const stockParam = sp.get("stock");
  const idsParam = sp.get("ids");
  const ids = idsParam
    ? idsParam
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isInteger(n) && n > 0)
    : undefined;
  const csv = await exportProductsCsv({
    q: sp.get("q") || undefined,
    categoryId: num(sp.get("categoryId")),
    brandId: num(sp.get("brandId")),
    status: sp.get("status") || undefined,
    stock: stockParam === "in" || stockParam === "out" ? stockParam : undefined,
    trashed: sp.get("trashed") === "1",
    ids: ids && ids.length > 0 ? ids : undefined,
  });

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(
    now.getHours()
  )}${pad(now.getMinutes())}`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="products-export-${stamp}.csv"`,
    },
  });
}
