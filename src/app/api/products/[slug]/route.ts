import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug, getProductVariants, listCategories } from "@/lib/products";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) return NextResponse.json({ error: "পণ্য পাওয়া যায়নি" }, { status: 404 });
    const variants = await getProductVariants(product.id);
    let categoryName: string | null = null;
    if (product.category_id) {
      const categories = await listCategories();
      categoryName = categories.find((c) => c.id === product.category_id)?.name ?? null;
    }
    return NextResponse.json({ product, variants, categoryName });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "পণ্য লোড করা যায়নি" }, { status: 500 });
  }
}
