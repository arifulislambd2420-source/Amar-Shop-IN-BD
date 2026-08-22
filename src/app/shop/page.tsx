import { listProducts, listCategories, searchProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string; sort?: string; page?: string; q?: string }>;
}) {
  const { category, brand, sort, page, q } = await searchParams;
  const categories = await listCategories();
  const products = q
    ? await searchProducts(q, 48)
    : await listProducts({
        categorySlug: category,
        brandId: brand ? Number(brand) : undefined,
        sort: sort === "price_asc" || sort === "price_desc" || sort === "newest" ? sort : undefined,
        page: page ? Number(page) : undefined,
        onlyActive: true,
      });
  const activeCat = categories.find((c) => c.slug === category);

  return (
    <div className="container-x py-8">
      <h1 className="text-2xl font-bold mb-6">{q ? `"${q}" এর ফলাফল` : activeCat ? activeCat.name : "সব পণ্য"}</h1>

      <div className="flex gap-2 flex-wrap mb-6">
        <Link
          href="/shop"
          className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
            !category ? "bg-brand-orange text-white border-brand-orange" : "border-gray-300 text-gray-600"
          }`}
        >
          সব
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/shop?category=${c.slug}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
              category === c.slug
                ? "bg-brand-orange text-white border-brand-orange"
                : "border-gray-300 text-gray-600"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500">কোনো পণ্য পাওয়া যায়নি।</p>
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
