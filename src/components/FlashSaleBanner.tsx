"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";

export default function FlashSaleBanner({ flashSale }: { flashSale: any }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!flashSale?.end_time) return;
    
    const target = new Date(flashSale.end_time).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }

      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [flashSale]);

  if (!flashSale || !timeLeft) return null;

  if (timeLeft.d === 0 && timeLeft.h === 0 && timeLeft.m === 0 && timeLeft.s === 0) {
    return null; // Flash sale ended
  }

  const items = flashSale.items || [];

  return (
    <section className="container-x py-8">
      <div className="bg-brand-orange text-white rounded-xl p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>⚡</span> {flashSale.title}
          </h2>
          <p className="opacity-90">সীমিত সময়ের অফার! দ্রুত অর্ডার করুন।</p>
        </div>
        <div className="flex gap-4">
          <TimeUnit value={timeLeft.d} label="দিন" />
          <TimeUnit value={timeLeft.h} label="ঘন্টা" />
          <TimeUnit value={timeLeft.m} label="মিনিট" />
          <TimeUnit value={timeLeft.s} label="সেকেন্ড" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item: any) => {
          // Transform item back to product shape for ProductCard
          const product = {
            id: item.product_id,
            slug: item.slug,
            name: item.name,
            price: item.price,
            sale_price: item.flash_price,
            image_url: item.image_url,
          };
          return (
            <div key={item.id} className="relative">
              <ProductCard product={product as any} />
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow z-10">
                FLASH DEAL
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-white/20 rounded-lg p-2 min-w-[60px]">
      <span className="text-xl font-bold font-mono">
        {value.toString().padStart(2, "0")}
      </span>
      <span className="text-xs uppercase">{label}</span>
    </div>
  );
}
