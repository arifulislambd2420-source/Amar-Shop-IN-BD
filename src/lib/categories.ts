import { getDb } from "./db";
import type { Category } from "./types";

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9ঀ-৿]+/g, "-")
      .replace(/^-+|-+$/g, "") || `c-${Date.now()}`
  );
}

const DUP_SLUG = "এই slug দিয়ে ইতিমধ্যে একটি category আছে";

export async function createCategory(input: { name: string; slug?: string; icon?: string | null }): Promise<number> {
  const db = await getDb();
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);
  try {
    const [res] = await db.execute("INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)", [
      input.name,
      slug,
      input.icon || null,
    ]);
    return (res as { insertId: number }).insertId;
  } catch (err) {
    if (err instanceof Error && /duplicate/i.test(err.message)) throw new Error(DUP_SLUG);
    throw err;
  }
}

export async function updateCategory(
  id: number,
  input: { name: string; slug?: string; icon?: string | null }
): Promise<void> {
  const db = await getDb();
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);
  try {
    await db.execute("UPDATE categories SET name = ?, slug = ?, icon = ? WHERE id = ?", [
      input.name,
      slug,
      input.icon || null,
      id,
    ]);
  } catch (err) {
    if (err instanceof Error && /duplicate/i.test(err.message)) throw new Error(DUP_SLUG);
    throw err;
  }
}

export async function deleteCategory(id: number): Promise<void> {
  const db = await getDb();
  // Detach products first so the FK doesn't block deletion (products keep working).
  await db.execute("UPDATE products SET category_id = NULL WHERE category_id = ?", [id]);
  await db.execute("DELETE FROM categories WHERE id = ?", [id]);
}
