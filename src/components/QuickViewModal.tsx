"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatTaka } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";
import { addProductToCart } from "./AddToCartButton";
import type { Product, ProductVariant } from "@/lib/types";

export default function QuickViewModal({
  slug,
  onClose,
}: {
  slug: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setProduct(data.product ?? null);
        setVariants(data.variants ?? []);
        setCategoryName(data.categoryName ?? null);
        setQuantity(1);
        setSelectedVariant(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const price = selectedVariant
    ? selectedVariant.price
    : product
    ? product.sale_price ?? product.price
    : 0;
  const originalPrice = selectedVariant ? null : product?.price ?? null;
  const onSale = !selectedVariant && product?.sale_price != null && product.sale_price < product.price;
  const stock = selectedVariant ? selectedVariant.stock : product?.stock ?? 0;
  const outOfStock = stock <= 0;

  function handleAddToCart() {
    if (!product || outOfStock) return;
    addProductToCart(product, addItem, {
      quantity,
      price,
      stock,
      variantLabel: selectedVariant?.label,
      variantId: selectedVariant?.id,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  function handleBuyNow() {
    if (!product || outOfStock) return;
    addProductToCart(product, addItem, {
      quantity,
      price,
      stock,
      variantLabel: selectedVariant?.label,
      variantId: selectedVariant?.id,
    });
    router.push("/checkout");
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
          <button
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 z-10"
          >
            ×
          </button>

          {loading || !product ? (
            <div className="p-10 text-center text-gray-500">লোড হচ্ছে...</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6 p-5">
              <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden">
                <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
              </div>

              <div className="flex flex-col gap-3">
                {categoryName && (
                  <span className="text-xs font-medium text-brand-orange bg-orange-50 w-fit px-2 py-0.5 rounded">
                    {categoryName}
                  </span>
                )}
                <Link href={`/product/${product.slug}`} onClick={onClose} className="font-bold text-lg hover:text-brand-orange">
                  {product.name}
                </Link>

                <div className="flex items-baseline gap-2">
                  <span className="text-brand-orange font-bold text-xl">{formatTaka(price)}</span>
                  {onSale && originalPrice != null && (
                    <span className="text-gray-400 text-sm line-through">{formatTaka(originalPrice)}</span>
                  )}
                </div>

                <p className="text-gray-600 text-sm line-clamp-3">{product.description}</p>

                {variants.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-1">পরিমাণ নির্বাচন করুন</div>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => {
                            setSelectedVariant(v);
                            setQuantity(1);
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                            selectedVariant?.id === v.id
                              ? "bg-brand-orange text-white border-brand-orange"
                              : "bg-white text-gray-700 border-gray-300 hover:border-brand-orange"
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">পরিমাণ</span>
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-8 w-8 rounded border border-gray-300 flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    disabled={quantity >= stock}
                    className="h-8 w-8 rounded border border-gray-300 flex items-center justify-center disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  {outOfStock ? "স্টক নেই" : `স্টক: ${stock} টি আছে`}
                </p>

                <div className="flex gap-2 mt-1">
                  <button
                    onClick={handleAddToCart}
                    disabled={outOfStock}
                    className={`flex-1 rounded-lg font-semibold py-2.5 transition-colors ${
                      outOfStock
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : added
                        ? "bg-green-600 text-white"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    {outOfStock ? "স্টক নেই" : added ? "যোগ হয়েছে ✓" : "কার্টে যোগ করুন"}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={outOfStock}
                    className={`flex-1 rounded-lg font-semibold py-2.5 transition-colors ${
                      outOfStock
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-brand-orange text-white hover:bg-brand-orange-dark"
                    }`}
                  >
                    অর্ডার করুন
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
