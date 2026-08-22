"use client";

import Link from "next/link";
import { useState } from "react";
import type { Brand } from "@/lib/types";

export default function BrandGrid({ brands }: { brands: Brand[] }) {
  const [query, setQuery] = useState("");
  const filtered = brands.filter((b) => b.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div>
      <input
        className="input max-w-sm mb-6"
        placeholder="ব্র্যান্ড খুঁজুন..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {filtered.length === 0 ? (
        <p className="text-gray-500">কোনো ব্র্যান্ড পাওয়া যায়নি।</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((b) => (
            <Link
              key={b.id}
              href={`/shop?brand=${b.id}`}
              className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-center h-24 hover:border-brand-orange hover:shadow-md transition"
            >
              {b.logo ? (
                <img src={b.logo} alt={b.name} className="max-h-12 max-w-full object-contain grayscale hover:grayscale-0 transition" />
              ) : (
                <span className="text-gray-500 font-semibold text-sm px-3 py-1 border border-gray-200 rounded-full text-center">
                  {b.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
