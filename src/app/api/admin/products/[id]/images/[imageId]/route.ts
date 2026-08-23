import { NextRequest, NextResponse } from "next/server";
import { getSessionUsername } from "@/lib/auth";
import { deleteProductImage } from "@/lib/products";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, imageId } = await params;
  try {
    await deleteProductImage(Number(id), Number(imageId));
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete image failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
