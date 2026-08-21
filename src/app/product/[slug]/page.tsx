import { getProductBySlug } from "@/lib/products";
import { formatTaka } from "@/lib/format";
import Image from "next/image";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.is_active) notFound();

  const price = product.sale_price ?? product.price;
  const onSale = product.sale_price != null && product.sale_price < product.price;

  return (
    <div className="container-x py-8 grid md:grid-cols-2 gap-8">
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
  );
}
