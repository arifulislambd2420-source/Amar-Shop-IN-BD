import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogBySlug, listBlogs } from "@/lib/blogs";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return { title: "ব্লগ পোস্ট পাওয়া যায়নি" };

  const title = blog.title;
  const description = blog.content.slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: blog.cover ? [{ url: blog.cover }] : undefined,
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) notFound();

  const allBlogs = await listBlogs();
  const related = allBlogs
    .filter((b) => b.id !== blog.id)
    .filter((b) => (blog.category ? b.category === blog.category : true))
    .slice(0, 3);
  const relatedFinal = related.length > 0 ? related : allBlogs.filter((b) => b.id !== blog.id).slice(0, 3);

  return (
    <div className="container-x py-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          {blog.category && (
            <span className="bg-brand-orange/10 text-brand-orange font-semibold px-2 py-0.5 rounded-full">
              {blog.category}
            </span>
          )}
          <span>{formatDate(blog.published_at)}</span>
          {blog.read_time && <span>· {blog.read_time} মিনিট পড়া</span>}
        </div>
        <h1 className="text-2xl font-bold mb-4">{blog.title}</h1>
        <div className="aspect-video bg-gradient-to-br from-brand-orange/20 to-gray-100 rounded-xl overflow-hidden mb-6">
          {blog.cover ? (
            <img src={blog.cover} alt={blog.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
              আমারশপ
            </div>
          )}
        </div>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{blog.content}</p>
      </div>

      {relatedFinal.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-bold mb-4">সম্পর্কিত পোস্ট</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedFinal.map((b) => (
              <Link
                key={b.id}
                href={`/blog/${b.slug}`}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-gradient-to-br from-brand-orange/20 to-gray-100">
                  {b.cover && <img src={b.cover} alt={b.title} className="w-full h-full object-cover" />}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold line-clamp-2">{b.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
