import type { Metadata } from "next";
import { listBrands } from "@/lib/products";
import BrandGrid from "./BrandGrid";

export const metadata: Metadata = {
  title: "ব্র্যান্ড সমূহ — আমারশপ",
  description: "আমাদের শীর্ষস্থানীয় ও বিশ্বস্ত ব্র্যান্ডের প্রাকৃতিক খাদ্যপণ্যসমূহ।",
};

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = await listBrands();

  return (
    <div className="container-x py-8">
      <h1 className="text-2xl font-bold mb-6">ব্র্যান্ডসমূহ</h1>
      {brands.length === 0 ? (
        <p className="text-gray-500">কোনো ব্র্যান্ড পাওয়া যায়নি।</p>
      ) : (
        <BrandGrid brands={brands} />
      )}
    </div>
  );
}
