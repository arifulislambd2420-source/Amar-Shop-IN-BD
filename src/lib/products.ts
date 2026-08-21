import { getDb } from "./db";
import type { Product, Category } from "./types";

export function listCategories(): Category[] {
  return getDb().prepare("SELECT * FROM categories ORDER BY name").all() as Category[];
}

export function listProducts(opts: { categorySlug?: string; onlyActive?: boolean } = {}): Product[] {
  const db = getDb();
  let sql = `SELECT p.* FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE 1=1`;
  const params: Record<string, unknown> = {};
  if (opts.onlyActive) sql += ` AND p.is_active = 1`;
  if (opts.categorySlug) {
    sql += ` AND c.slug = @categorySlug`;
    params.categorySlug = opts.categorySlug;
  }
  sql += ` ORDER BY p.created_at DESC`;
  return db.prepare(sql).all(params) as Product[];
}

export function getProductBySlug(slug: string): Product | undefined {
  return getDb().prepare("SELECT * FROM products WHERE slug = ?").get(slug) as Product | undefined;
}

export function getProductById(id: number): Product | undefined {
  return getDb().prepare("SELECT * FROM products WHERE id = ?").get(id) as Product | undefined;
}

export function featuredProducts(limit = 8): Product[] {
  return getDb()
    .prepare("SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC LIMIT ?")
    .all(limit) as Product[];
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ঀ-৿]+/g, "-")
    .replace(/^-+|-+$/g, "") || `p-${Date.now()}`;
}

export function createProduct(input: {
  name: string;
  description: string;
  price: number;
  sale_price: number | null;
  image: string;
  category_id: number | null;
  stock: number;
}) {
  const db = getDb();
  let slug = slugify(input.name);
  const exists = db.prepare("SELECT id FROM products WHERE slug = ?").get(slug);
  if (exists) slug = `${slug}-${Date.now().toString().slice(-5)}`;
  const info = db
    .prepare(
      `INSERT INTO products (name, slug, description, price, sale_price, image, category_id, stock)
       VALUES (@name, @slug, @description, @price, @sale_price, @image, @category_id, @stock)`
    )
    .run({ ...input, slug });
  return info.lastInsertRowid as number;
}

export function updateProduct(
  id: number,
  input: Partial<{
    name: string;
    description: string;
    price: number;
    sale_price: number | null;
    image: string;
    category_id: number | null;
    stock: number;
    is_active: number;
  }>
) {
  const db = getDb();
  const current = getProductById(id);
  if (!current) throw new Error("Product not found");
  const merged = { ...current, ...input };
  db.prepare(
    `UPDATE products SET name=@name, description=@description, price=@price, sale_price=@sale_price,
     image=@image, category_id=@category_id, stock=@stock, is_active=@is_active WHERE id=@id`
  ).run({ ...merged, id });
}

export function deleteProduct(id: number) {
  getDb().prepare("DELETE FROM products WHERE id = ?").run(id);
}
