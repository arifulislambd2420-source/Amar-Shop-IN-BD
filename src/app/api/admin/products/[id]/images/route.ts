import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUsername } from "@/lib/auth";
import { listProductImages, addProductImage, reorderProductImages } from "@/lib/products";

const addSchema = z.object({
  url: z.string().min(1, "URL দিন").max(500),
  alt: z.string().max(255).nullable().optional(),
});

const reorderSchema = z.object({
  orderedIds: z.array(z.number().int().positive()),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const images = await listProductImages(Number(id));
  return NextResponse.json({ images });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }
  try {
    const imageId = await addProductImage(Number(id), parsed.data.url, parsed.data.alt ?? null);
    return NextResponse.json({ id: imageId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Add image failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUsername();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }
  try {
    await reorderProductImages(Number(id), parsed.data.orderedIds);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Reorder failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
