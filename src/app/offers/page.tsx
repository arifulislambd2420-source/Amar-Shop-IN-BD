import type { Metadata } from "next";
import { listProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export const metadata: Metadata = {
  title: "অফার ও বিশেষ মূল্যছাড় — আমারশপ",
  description: "সেরা মূল্যে খাঁটি ও প্রাকৃতিক পণ্যের বিশেষ অফার এবং ডিসকাউন্টসমূহ।",
};

export const dynamic = "force-dynamic";

const SORTS = [
  { value: "", label: "নতুন" },
  { value: "price_asc", label: "কম দাম আগে" },
  { value: "price_desc", label: "বেশি দাম আগে" },
] as const;

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string }>;
}) {
  const { sort, page } = await searchParams;
  const validSort = sort === "price_asc" || sort === "price_desc" ? sort : undefined;
  const products = await listProducts({
    onlyDiscounted: true,
    sort: validSort,
    page: page ? Number(page) : undefined,
    onlyActive: true,
  });

  return (
    <div className="container-x py-8">
      <h1 className="text-2xl font-bold mb-2">অফার সমূহ</h1>
      <p className="text-gray-500 mb-6">{products.length} টি পণ্য পাওয়া গেছে</p>

      <div className="flex gap-2 flex-wrap mb-6">
        {SORTS.map((s) => (
          <Link
            key={s.value}
            href={s.value ? `/offers?sort=${s.value}` : "/offers"}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
              (sort || "") === s.value
                ? "bg-brand-orange text-white border-brand-orange"
                : "border-gray-300 text-gray-600"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500">এই মুহূর্তে কোনো অফার নেই।</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
