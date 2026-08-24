import Link from "next/link";
import LiveEditable from "@/components/editor/LiveEditable";
import { featuredProducts, listCategories, listProducts, listBrands } from "@/lib/products";
import { listBlogs } from "@/lib/blogs";
import { getBanners } from "@/lib/banners";
import { getActiveFlashSale } from "@/lib/marketing";
import ProductCard from "@/components/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import PromoBanner from "@/components/PromoBanner";
import FlashSaleBanner from "@/components/FlashSaleBanner";

export const dynamic = "force-dynamic";

const CATEGORY_ICON_FALLBACK = "🛍️";

const SECTION_CATEGORIES = ["honey", "mustard-oil"];

export default async function HomePage() {
  const [categories, products, heroBanners, sideBanners, promoBanners, discounted, brands, blogs, activeFlashSale] =
    await Promise.all([
      listCategories(),
      featuredProducts(8),
      getBanners("hero"),
      getBanners("side"),
      getBanners("promo"),
      listProducts({ onlyActive: true, onlyDiscounted: true, pageSize: 8, page: 1 }),
      listBrands(),
      listBlogs(),
      getActiveFlashSale(),
    ]);

  const sectionProducts = await Promise.all(
    SECTION_CATEGORIES.map((slug) => listProducts({ categorySlug: slug, onlyActive: true, pageSize: 8, page: 1 }))
  );
  const sectionCategories = SECTION_CATEGORIES.map((slug) => categories.find((c) => c.slug === slug)).filter(
    (c): c is NonNullable<typeof c> => Boolean(c)
  );

  return (
    <div>
      <section className="container-x py-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <HeroSlider banners={heroBanners} />
        <div className="grid grid-rows-2 gap-4">
          <PromoBanner
            banner={sideBanners[0]}
            fallbackTitle="সেরা মানের মধু"
            fallbackSubtitle="সরাসরি চাষী থেকে, ১০০% খাঁটি"
            className="h-full min-h-[120px]"
          />
          <PromoBanner
            banner={sideBanners[1]}
            fallbackTitle="ফ্রি ডেলিভারি"
            fallbackSubtitle="নির্দিষ্ট পরিমাণ কেনাকাটায়"
            className="h-full min-h-[120px]"
          />
        </div>
      </section>

      <section className="container-x py-8">
        <LiveEditable pageKey="home" sectionKey="categories" elementKey="title" as="h2" className="text-xl font-bold mb-4" fallback="ক্যাটাগরি" />
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => {
            const isImg = !!c.icon && /^(https?:\/\/|\/)/.test(c.icon);
            return (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className="snap-start shrink-0 w-28 sm:w-32 bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-2 text-center font-medium hover:border-brand-orange hover:text-brand-orange transition-colors"
              >
                {isImg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.icon!} alt={c.name} className="h-10 w-10 object-contain" />
                ) : (
                  <span className="text-2xl">{c.icon || CATEGORY_ICON_FALLBACK}</span>
                )}
                <span className="text-sm truncate w-full">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {activeFlashSale && <FlashSaleBanner flashSale={activeFlashSale} />}

      {discounted.length > 0 && (
        <section className="container-x py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              <span className="text-brand-orange">Hot Deal</span> — বিশেষ ছাড়
            </h2>
            <Link href="/shop" className="text-brand-orange text-sm font-medium">
              সব দেখুন →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {discounted.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {sectionCategories.map((cat, idx) => {
        const items = sectionProducts[idx];
        if (!items || items.length === 0) return null;
        return (
          <section key={cat.id} className="container-x py-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{cat.name}</h2>
              <Link href={`/shop?category=${cat.slug}`} className="text-brand-orange text-sm font-medium">
                সব দেখুন →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="container-x py-8">
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

      {brands.length > 0 && (
        <section className="container-x py-8">
          <h2 className="text-xl font-bold mb-4">ব্র্যান্ডসমূহ</h2>
          <div className="flex flex-wrap items-center gap-6 bg-white border border-gray-200 rounded-xl p-6">
            {brands.map((b) =>
              b.logo ? (
                <img key={b.id} src={b.logo} alt={b.name} className="h-10 object-contain grayscale hover:grayscale-0 transition" />
              ) : (
                <span key={b.id} className="text-gray-500 font-semibold text-sm px-3 py-1 border border-gray-200 rounded-full">
                  {b.name}
                </span>
              )
            )}
          </div>
        </section>
      )}

      {blogs.length > 0 && (
        <section className="container-x py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">ব্লগ</h2>
            <Link href="/blog" className="text-brand-orange text-sm font-medium">
              সব দেখুন →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {blogs.slice(0, 5).map((b) => (
              <Link
                key={b.id}
                href={`/blog/${b.slug}`}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-gray-100">
                  {b.cover && <img src={b.cover} alt={b.title} className="w-full h-full object-cover" />}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold line-clamp-2">{b.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-x py-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <PromoBanner
          banner={promoBanners[0]}
          fallbackTitle="সীমিত সময়ের অফার"
          fallbackSubtitle="প্রথম অর্ডারে বিশেষ ছাড় পান"
          className="h-40 md:h-48"
        />
        <PromoBanner
          banner={promoBanners[1]}
          fallbackTitle="Cash on Delivery"
          fallbackSubtitle="সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা"
          className="h-40 md:h-48"
        />
      </section>
    </div>
  );
}
