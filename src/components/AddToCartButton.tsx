"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/lib/types";
import { pushToDataLayer } from "@/lib/gtm-client";

export function addProductToCart(
  product: Product,
  addItem: (item: {
    productId: number;
    name: string;
    slug: string;
    price: number;
    image: string;
    quantity: number;
    stock: number;
    variantLabel?: string;
    variantId?: number;
  }) => void,
  options?: { quantity?: number; variantLabel?: string; variantId?: number; price?: number; stock?: number }
) {
  const finalPrice = options?.price ?? product.sale_price ?? product.price;
  
  addItem({
    productId: product.id,
    name: product.name,
    slug: product.slug,
    price: finalPrice,
    image: product.image,
    quantity: options?.quantity ?? 1,
    stock: options?.stock ?? product.stock,
    variantLabel: options?.variantLabel,
    variantId: options?.variantId,
  });

  pushToDataLayer("add_to_cart", {
    ecommerce: {
      currency: "BDT",
      value: finalPrice * (options?.quantity ?? 1),
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: finalPrice,
          quantity: options?.quantity ?? 1,
        }
      ]
    }
  });
}

export default function AddToCartButton({
  product,
  compact = false,
  iconOnly = false,
}: {
  product: Product;
  compact?: boolean;
  iconOnly?: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    if (outOfStock) return;
    addProductToCart(product, addItem);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  if (iconOnly) {
    return (
      <button
        onClick={handleAdd}
        disabled={outOfStock}
        aria-label="কার্টে যোগ করুন"
        className={`shrink-0 flex items-center justify-center h-9 w-9 rounded-lg border transition-colors ${
          outOfStock
            ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
            : added
            ? "bg-green-600 text-white border-green-600"
            : "bg-white text-brand-orange border-brand-orange hover:bg-brand-orange hover:text-white"
        }`}
      >
        <CartGlyph />
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={outOfStock}
      className={`w-full rounded-lg font-semibold transition-colors ${
        compact ? "text-sm py-1.5" : "text-base py-2.5"
      } ${
        outOfStock
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : added
          ? "bg-green-600 text-white"
          : "bg-brand-orange text-white hover:bg-brand-orange-dark"
      }`}
    >
      {outOfStock ? "স্টক নেই" : added ? "যোগ হয়েছে ✓" : "কার্টে যোগ করুন"}
    </button>
  );
}

function CartGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
