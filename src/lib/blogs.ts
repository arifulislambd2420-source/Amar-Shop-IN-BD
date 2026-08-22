import { getDb } from "./db";
import type { Blog } from "./types";

export type BlogListItem = Omit<Blog, "content">;

export async function listBlogs(): Promise<BlogListItem[]> {
  const db = await getDb();
  const [rows] = await db.query(
    "SELECT id, title, slug, cover, category, read_time, published_at FROM blogs ORDER BY published_at DESC"
  );
  return rows as BlogListItem[];
}

export async function getBlogBySlug(slug: string): Promise<Blog | undefined> {
  const db = await getDb();
  const [rows] = await db.execute("SELECT * FROM blogs WHERE slug = ?", [slug]);
  return (rows as Blog[])[0];
}
