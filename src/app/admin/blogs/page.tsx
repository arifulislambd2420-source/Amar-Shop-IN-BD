import BlogsAdmin from "@/components/admin/BlogsAdmin";
import { listAllBlogs } from "@/lib/blogs";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const blogs = await listAllBlogs();
  return <BlogsAdmin initialBlogs={blogs} />;
}
