"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/lib/types";

export default function AddToCartButton({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    if (outOfStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.sale_price ?? product.price,
      image: product.image,
      quantity: 1,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
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
