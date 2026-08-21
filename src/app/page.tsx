import Link from "next/link";
import { featuredProducts, listCategories } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const categories = await listCategories();
  const products = await featuredProducts(8);

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-navy to-brand-navy-light text-white">
        <div className="container-x py-14 md:py-20 text-center">
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
      </section>

      <section className="container-x py-10">
        <h2 className="text-xl font-bold mb-4">ক্যাটাগরি</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className="bg-white border border-gray-200 rounded-xl p-4 text-center font-medium hover:border-brand-orange hover:text-brand-orange transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-x py-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">সব পণ্য</h2>
          <Link href="/shop" className="text-brand-orange text-sm font-medium">
            সব দেখুন →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
