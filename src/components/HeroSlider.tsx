"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Banner } from "@/lib/types";

export default function HeroSlider({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const hasBanners = banners.length > 0;

  useEffect(() => {
    if (!hasBanners || banners.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [hasBanners, banners.length]);

  if (!hasBanners) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-brand-navy to-brand-navy-light text-white">
        <div className="py-14 md:py-20 px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
            খাঁটি ও প্রাকৃতিক পণ্য, <span className="text-brand-orange">আপনার দোরগোড়ায়</span>
          </h1>
          <p className="text-white/70 max-w-xl mx-auto mb-8">
            মধু, সরিষার তেল, ঘি, খেজুর — Cash on Delivery সুবিধায় সারাদেশে ডেলিভারি
          </p>
          <Link
            href="/shop"
            className="inline-block bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold px-8 py-3 rounded-full transition-colors"
          >
            এখনই কিনুন
          </Link>
        </div>
      </div>
    );
  }

  function prev() {
    setIndex((i) => (i - 1 + banners.length) % banners.length);
  }
  function next() {
    setIndex((i) => (i + 1) % banners.length);
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[16/7]">
      {banners.map((b, i) => {
        const content = (
          <div className="relative w-full h-full">
            <Image
              src={b.image}
              alt="banner"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 66vw"
              priority={i === 0}
            />
          </div>
        );
        return (
          <div
            key={b.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              i === index ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {b.link ? <Link href={b.link}>{content}</Link> : content}
          </div>
        );
      })}

      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="আগের ব্যানার"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm"
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="পরের ব্যানার"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                onClick={() => setIndex(i)}
                aria-label={`ব্যানার ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-brand-orange" : "w-1.5 bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
