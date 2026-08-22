import mysql from "mysql2/promise";
import { getDb } from "./db";
import type { Blog } from "./types";

export type BlogListItem = Blog;

export async function listBlogs(): Promise<BlogListItem[]> {
  const db = await getDb();
  const [rows] = await db.query(
    "SELECT id, title, slug, cover, category, content, read_time, published_at FROM blogs ORDER BY published_at DESC"
  );
  return rows as BlogListItem[];
}

export async function getBlogBySlug(slug: string): Promise<Blog | undefined> {
  const db = await getDb();
  const [rows] = await db.execute("SELECT * FROM blogs WHERE slug = ?", [slug]);
  return (rows as Blog[])[0];
}

export async function listAllBlogs(): Promise<Blog[]> {
  const db = await getDb();
  const [rows] = await db.query("SELECT * FROM blogs ORDER BY published_at DESC");
  return rows as Blog[];
}

export async function getBlogById(id: number): Promise<Blog | undefined> {
  const db = await getDb();
  const [rows] = await db.execute("SELECT * FROM blogs WHERE id = ?", [id]);
  return (rows as Blog[])[0];
}

export async function createBlog(input: {
  title: string;
  slug: string;
  cover: string | null;
  category: string | null;
  content: string;
  read_time: number | null;
  published_at: string;
}): Promise<number> {
  const db = await getDb();
  const [existingRows] = await db.execute("SELECT id FROM blogs WHERE slug = ?", [input.slug]);
  if ((existingRows as { id: number }[])[0]) {
    throw new Error("এই স্লাগ দিয়ে ইতিমধ্যে একটি ব্লগ আছে");
  }
  const [result] = await db.execute(
    "INSERT INTO blogs (title, slug, cover, category, content, read_time, published_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [input.title, input.slug, input.cover, input.category, input.content, input.read_time, input.published_at]
  );
  return (result as mysql.ResultSetHeader).insertId;
}

export async function updateBlog(
  id: number,
  input: Partial<{
    title: string;
    slug: string;
    cover: string | null;
    category: string | null;
    content: string;
    read_time: number | null;
    published_at: string;
  }>
): Promise<void> {
  const db = await getDb();
  const current = await getBlogById(id);
  if (!current) throw new Error("Blog not found");
  if (input.slug && input.slug !== current.slug) {
    const [existingRows] = await db.execute("SELECT id FROM blogs WHERE slug = ? AND id != ?", [input.slug, id]);
    if ((existingRows as { id: number }[])[0]) {
      throw new Error("এই স্লাগ দিয়ে ইতিমধ্যে একটি ব্লগ আছে");
    }
  }
  const merged = { ...current, ...input };
  await db.execute(
    "UPDATE blogs SET title=?, slug=?, cover=?, category=?, content=?, read_time=?, published_at=? WHERE id=?",
    [merged.title, merged.slug, merged.cover, merged.category, merged.content, merged.read_time, merged.published_at, id]
  );
}

export async function deleteBlog(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM blogs WHERE id = ?", [id]);
}
