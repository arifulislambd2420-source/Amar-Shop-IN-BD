import Link from "next/link";
import { listBlogs } from "@/lib/blogs";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}

function excerpt(content: string, len = 150) {
  const text = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > len ? `${text.slice(0, len).trim()}...` : text;
}

export default async function BlogListPage() {
  const blogs = await listBlogs();

  return (
    <div className="container-x py-8">
      <h1 className="text-2xl font-bold mb-6">ব্লগ</h1>
      {blogs.length === 0 ? (
        <p className="text-gray-500">কোনো ব্লগ পোস্ট পাওয়া যায়নি।</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {blogs.map((b) => (
            <Link
              key={b.id}
              href={`/blog/${b.slug}`}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="aspect-video bg-gradient-to-br from-brand-orange/20 to-gray-100 relative">
                {b.cover ? (
                  <img src={b.cover} alt={b.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                    আমারশপ
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {b.category && (
                    <span className="bg-brand-orange/10 text-brand-orange font-semibold px-2 py-0.5 rounded-full">
                      {b.category}
                    </span>
                  )}
                  <span>{formatDate(b.published_at)}</span>
                  {b.read_time && <span>· {b.read_time} মিনিট পড়া</span>}
                </div>
                <h2 className="font-semibold line-clamp-2">{b.title}</h2>
                <p className="text-sm text-gray-500 line-clamp-3">{excerpt(b.content)}</p>
                <span className="mt-auto text-brand-orange text-sm font-medium">আরও পড়ুন →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
