import type { Metadata } from "next";
import { getProductBySlug, getProductReviews, listProducts } from "@/lib/products";
import { formatTaka } from "@/lib/format";
import Image from "next/image";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import ProductReviews from "@/components/ProductReviews";
import ProductCard from "@/components/ProductCard";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "পণ্য পাওয়া যায়নি" };

  const title = product.seo_title || `${product.name} — কিনুন সেরা দামে`;
  const description = product.meta_description || product.description?.slice(0, 160) || `${product.name} অনলাইনে অর্ডার করুন ক্যাশ অন ডেলিভারিতে।`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.image ? [{ url: product.image }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.is_active) notFound();

  const reviews = await getProductReviews(product.id, true);
  
  // Fetch similar products (same category, excluding current product)
  const similarProductsResult = await listProducts({
    categoryId: product.category_id || undefined,
    onlyActive: true,
    pageSize: 5,
  });
  const similarProducts = similarProductsResult.filter(p => p.id !== product.id).slice(0, 4);

  const price = product.sale_price ?? product.price;
  const onSale = product.sale_price != null && product.sale_price < product.price;

  return (
    <div className="container-x py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden">
          <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl font-bold text-brand-orange">{formatTaka(price)}</span>
            {onSale && <span className="text-gray-400 line-through">{formatTaka(product.price)}</span>}
          </div>
          <p className="text-gray-600 mb-6 whitespace-pre-line">{product.description}</p>
          <p className="text-sm text-gray-500 mb-4">
            স্টক: {product.stock > 0 ? `${product.stock} টি আছে` : "স্টক নেই"}
          </p>
          <div className="max-w-xs">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
      
      <ProductReviews productId={product.id} initialReviews={reviews} />

      {similarProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">সিমিলার প্রোডাক্ট</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
