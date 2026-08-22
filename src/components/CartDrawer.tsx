"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { formatTaka } from "@/lib/format";

export default function CartDrawer() {
  const { items, setQuantity, removeItem, subtotal, isDrawerOpen, closeDrawer } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isDrawerOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isDrawerOpen]);

  if (!mounted || !isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-bold text-lg">আপনার কার্ট</h2>
          <button
            onClick={closeDrawer}
            aria-label="বন্ধ করুন"
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
          >
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-gray-500">আপনার কার্টটি এখন খালি।</p>
            <Link
              href="/shop"
              onClick={closeDrawer}
              className="text-brand-orange font-semibold"
            >
              শপিং শুরু করুন →
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 items-center border border-gray-200 rounded-lg p-2">
                  <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-gray-50">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-brand-orange font-semibold text-sm">{formatTaka(item.price)}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        className="h-6 w-6 rounded border border-gray-300 flex items-center justify-center text-sm"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="h-6 w-6 rounded border border-gray-300 flex items-center justify-center text-sm disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label="সরিয়ে ফেলুন"
                    className="text-red-500 hover:text-red-600 p-2 shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 p-4 flex flex-col gap-3">
              <div className="flex justify-between font-semibold">
                <span>সাবটোটাল</span>
                <span className="text-brand-orange">{formatTaka(subtotal())}</span>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="flex-1 text-center border border-brand-orange text-brand-orange font-semibold py-2.5 rounded-lg hover:bg-orange-50"
                >
                  কার্ট দেখুন
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="flex-1 text-center bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold py-2.5 rounded-lg"
                >
                  চেকআউট
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
