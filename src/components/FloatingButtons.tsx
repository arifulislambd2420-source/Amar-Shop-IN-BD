"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";

// Configure via env: NEXT_PUBLIC_WHATSAPP_NUMBER (digits only, with country code, no +)
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801XXXXXXXXX";

export default function FloatingButtons() {
  const count = useCartStore((s) => s.count());
  const openDrawer = useCartStore((s) => s.openDrawer);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-40 flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={openDrawer}
        aria-label="কার্ট দেখুন"
        className="relative h-12 w-12 rounded-full bg-brand-orange text-white shadow-lg flex items-center justify-center hover:bg-brand-orange-dark transition-colors"
      >
        <CartIcon />
        {mounted && count > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-brand-orange text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border border-brand-orange">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="হোয়াটসঅ্যাপে যোগাযোগ করুন"
        className="h-12 w-12 rounded-full bg-green-500 text-white shadow-lg flex items-center justify-center hover:bg-green-600 transition-colors"
      >
        <WhatsAppIcon />
      </a>
    </div>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.47 14.38c-.29-.15-1.71-.85-1.98-.94-.27-.1-.46-.15-.66.15-.2.29-.76.94-.93 1.13-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.71-1.6-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.59-.9-2.18-.24-.57-.48-.5-.66-.51h-.56c-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.43 0 1.43 1.04 2.82 1.19 3.01.15.2 2.05 3.13 4.97 4.39.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.11.55-.08 1.71-.7 1.95-1.38.24-.68.24-1.26.17-1.38-.07-.12-.27-.2-.56-.34z" />
      <path d="M12.01 2C6.49 2 2 6.48 2 11.99c0 1.94.55 3.75 1.5 5.29L2 22l4.86-1.44c1.48.81 3.18 1.28 4.99 1.28h.01c5.52 0 10.01-4.48 10.01-9.99C21.87 6.48 17.53 2 12.01 2zm0 18.13h-.01c-1.6 0-3.16-.43-4.51-1.24l-.32-.19-3.34.99.9-3.28-.21-.34a8.06 8.06 0 0 1-1.24-4.28c0-4.48 3.65-8.13 8.14-8.13 2.17 0 4.21.85 5.75 2.39a8.06 8.06 0 0 1 2.38 5.76c-.01 4.48-3.66 8.12-8.14 8.12z" />
    </svg>
  );
}
