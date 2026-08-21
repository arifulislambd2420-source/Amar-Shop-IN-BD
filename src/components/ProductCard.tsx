import Link from "next/link";
import Image from "next/image";
import { formatTaka } from "@/lib/format";
import type { Product } from "@/lib/types";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product }: { product: Product }) {
  const price = product.sale_price ?? product.price;
  const onSale = product.sale_price != null && product.sale_price < product.price;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <Link href={`/product/${product.slug}`} className="block relative aspect-square bg-gray-50">
        <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" />
        {onSale && (
          <span className="absolute top-2 left-2 bg-brand-orange text-white text-xs font-bold px-2 py-0.5 rounded">
            SALE
          </span>
        )}
      </Link>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <Link href={`/product/${product.slug}`} className="text-sm font-medium line-clamp-2 hover:text-brand-orange">
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-brand-orange font-bold">{formatTaka(price)}</span>
          {onSale && (
            <span className="text-gray-400 text-xs line-through">{formatTaka(product.price)}</span>
          )}
        </div>
        <div className="mt-auto">
          <AddToCartButton product={product} compact />
        </div>
      </div>
    </div>
  );
}
