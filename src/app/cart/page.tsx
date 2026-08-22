"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/cart-store";
import { formatTaka, SHIPPING_FEE } from "@/lib/format";
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

  const sub = subtotal();
  const discount = 0;
  const total = sub + SHIPPING_FEE - discount;

  return (
    <div className="container-x py-8">
      <h1 className="text-2xl font-bold mb-6">আপনার কার্ট</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                <th className="pb-3 font-medium">পণ্য</th>
                <th className="pb-3 font-medium">মূল্য</th>
                <th className="pb-3 font-medium">পরিমাণ</th>
                <th className="pb-3 font-medium">সাবটোটাল</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.productId} className="border-b border-gray-100">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-gray-50">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                      </div>
                      <Link href={`/product/${item.slug}`} className="font-medium hover:text-brand-orange">
                        {item.name}
                      </Link>
                    </div>
                  </td>
                  <td className="py-3 pr-3 whitespace-nowrap">{formatTaka(item.price)}</td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
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
                  </td>
                  <td className="py-3 pr-3 whitespace-nowrap font-semibold text-brand-orange">
                    {formatTaka(item.price * item.quantity)}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => removeItem(item.productId)}
                      aria-label="সরিয়ে ফেলুন"
                      className="text-red-500 hover:text-red-600 p-2"
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border border-gray-200 rounded-xl p-5 h-fit">
          <div className="font-semibold mb-3">অর্ডার সামারি</div>
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-600">সাবটোটাল</span>
            <span className="font-semibold">{formatTaka(sub)}</span>
          </div>
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-600">ডেলিভারি চার্জ</span>
            <span className="font-semibold">{formatTaka(SHIPPING_FEE)}</span>
          </div>
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-600">ডিসকাউন্ট</span>
            <span className="font-semibold">{formatTaka(discount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3 mb-4">
            <span>মোট</span>
            <span className="text-brand-orange">{formatTaka(total)}</span>
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
