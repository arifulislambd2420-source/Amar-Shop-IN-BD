"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatTaka } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import AddToCartButton, { addProductToCart } from "./AddToCartButton";
import QuickViewModal from "./QuickViewModal";

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const price = product.sale_price ?? product.price;
  const onSale = product.sale_price != null && product.sale_price < product.price;
  const discountPct = onSale
    ? Math.round(((product.price - (product.sale_price as number)) / product.price) * 100)
    : 0;

  const addItem = useCartStore((s) => s.addItem);
  const wishlisted = useWishlistStore((s) => s.has(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const outOfStock = product.stock <= 0;

  function handleBuyNow() {
    if (outOfStock) return;
    addProductToCart(product, addItem);
    router.push("/checkout");
  }

  const [imgSrc, setImgSrc] = useState(product.image || "/placeholder.svg");

  return (
    <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <Link href={`/product/${product.slug}`} className="block relative aspect-square bg-gray-50">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, 25vw"
          onError={() => setImgSrc("/placeholder.svg")}
        />
        {onSale && discountPct > 0 && (
          <span className="absolute top-2 left-2 bg-brand-orange text-white text-xs font-bold px-2 py-0.5 rounded">
            -{discountPct}%
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label="পছন্দের তালিকায় যোগ করুন"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
        >
          <HeartIcon filled={mounted && wishlisted} />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setQuickViewOpen(true);
          }}
          aria-label="দ্রুত দেখুন"
          className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <EyeIcon />
        </button>
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
        <div className="mt-auto flex items-center gap-2">
          <button
            onClick={handleBuyNow}
            disabled={outOfStock}
            className={`flex-1 rounded-lg text-sm font-semibold py-1.5 transition-colors ${
              outOfStock
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-brand-orange text-white hover:bg-brand-orange-dark"
            }`}
          >
            {outOfStock ? "স্টক নেই" : "অর্ডার করুন"}
          </button>
          <AddToCartButton product={product} iconOnly />
        </div>
      </div>
      {quickViewOpen && (
        <QuickViewModal slug={product.slug} onClose={() => setQuickViewOpen(false)} />
      )}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "#ff8c00" : "none"}
      stroke={filled ? "#ff8c00" : "currentColor"}
      strokeWidth="2"
      className="text-gray-500"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z" />
    </svg>
  );
}
