"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { useEffect, useState } from "react";

export default function Header() {
  const count = useCartStore((s) => s.count());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 bg-brand-navy text-white">
      <div className="container-x flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold tracking-tight">
          আমার<span className="text-brand-orange">শপ</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-brand-orange">হোম</Link>
          <Link href="/shop" className="hover:text-brand-orange">শপ</Link>
          <Link href="/track" className="hover:text-brand-orange">অর্ডার ট্র্যাকিং</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative flex items-center">
            <CartIcon />
            {mounted && count > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
