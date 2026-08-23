import { NextRequest, NextResponse } from "next/server";
import { getSessionUsername } from "@/lib/auth";
import { duplicateProduct } from "@/lib/products";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const newId = await duplicateProduct(Number(id));
    return NextResponse.json({ id: newId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Duplicate failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
