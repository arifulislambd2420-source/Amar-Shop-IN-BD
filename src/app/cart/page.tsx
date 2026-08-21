"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/cart-store";
import { formatTaka } from "@/lib/format";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, setQuantity, removeItem, subtotal } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container-x py-16 text-center">
        <p className="text-gray-500 mb-4">আপনার কার্টটি এখন খালি।</p>
        <Link href="/shop" className="text-brand-orange font-semibold">শপিং শুরু করুন →</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <h1 className="text-2xl font-bold mb-6">আপনার কার্ট</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 items-center border border-gray-200 rounded-xl p-3">
              <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-gray-50">
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
              </div>
              <div className="flex-1">
                <Link href={`/product/${item.slug}`} className="font-medium hover:text-brand-orange">
                  {item.name}
                </Link>
                <div className="text-brand-orange font-semibold">{formatTaka(item.price)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => setQuantity(item.productId, item.quantity - 1)}
                    className="h-7 w-7 rounded border border-gray-300 flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="h-7 w-7 rounded border border-gray-300 flex items-center justify-center disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.productId)}
                aria-label="সরিয়ে ফেলুন"
                className="text-red-500 hover:text-red-600 p-2"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
        <div className="border border-gray-200 rounded-xl p-5 h-fit">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">সাবটোটাল</span>
            <span className="font-semibold">{formatTaka(subtotal())}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3 mb-4">
            <span>মোট</span>
            <span className="text-brand-orange">{formatTaka(subtotal())}</span>
          </div>
          <Link
            href="/checkout"
            className="block text-center bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold py-3 rounded-lg"
          >
            চেকআউট করুন
          </Link>
        </div>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
    </svg>
  );
}
