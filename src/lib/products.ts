import mysql from "mysql2/promise";
import { getDb } from "./db";
import type { Product, Category } from "./types";

export async function listCategories(): Promise<Category[]> {
  const db = await getDb();
  const [rows] = await db.query("SELECT * FROM categories ORDER BY name");
  return rows as Category[];
}

export async function listBrands(): Promise<{ id: number; name: string; logo: string | null }[]> {
  const db = await getDb();
  const [rows] = await db.query("SELECT * FROM brands ORDER BY name");
  return rows as { id: number; name: string; logo: string | null }[];
}

export type ProductSort = "price_asc" | "price_desc" | "newest";

export async function listProducts(
  opts: {
    categorySlug?: string;
    categoryId?: number;
    brandId?: number;
    onlyActive?: boolean;
    onlyDiscounted?: boolean;
    sort?: ProductSort;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<Product[]> {
  const db = await getDb();
  let sql = `SELECT p.* FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE 1=1`;
  const params: (string | number)[] = [];
  if (opts.onlyActive) sql += ` AND p.is_active = 1`;
  if (opts.onlyDiscounted) sql += ` AND p.sale_price IS NOT NULL AND p.sale_price < p.price`;
  if (opts.categorySlug) {
    sql += ` AND c.slug = ?`;
    params.push(opts.categorySlug);
  }
  if (opts.categoryId) {
    sql += ` AND p.category_id = ?`;
    params.push(opts.categoryId);
  }
  if (opts.brandId) {
    sql += ` AND p.brand_id = ?`;
    params.push(opts.brandId);
  }
  switch (opts.sort) {
    case "price_asc":
      sql += ` ORDER BY COALESCE(p.sale_price, p.price) ASC`;
      break;
    case "price_desc":
      sql += ` ORDER BY COALESCE(p.sale_price, p.price) DESC`;
      break;
    default:
      sql += ` ORDER BY p.created_at DESC`;
  }
  if (opts.page) {
    const pageSize = opts.pageSize || 12;
    const page = Math.max(1, opts.page);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(pageSize, (page - 1) * pageSize);
  }
  const [rows] = await db.execute(sql, params);
  return rows as Product[];
}

export async function searchProducts(q: string, limit = 8): Promise<Product[]> {
  const db = await getDb();
  const term = `%${q}%`;
  const [rows] = await db.execute(
    "SELECT * FROM products WHERE is_active = 1 AND name LIKE ? ORDER BY created_at DESC LIMIT ?",
    [term, limit]
  );
  return rows as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const db = await getDb();
  const [rows] = await db.execute("SELECT * FROM products WHERE slug = ?", [slug]);
  return (rows as Product[])[0];
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const db = await getDb();
  const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [id]);
  return (rows as Product[])[0];
}

export async function featuredProducts(limit = 8): Promise<Product[]> {
  const db = await getDb();
  const [rows] = await db.query("SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC LIMIT ?", [limit]);
  return rows as Product[];
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ঀ-৿]+/g, "-")
    .replace(/^-+|-+$/g, "") || `p-${Date.now()}`;
}

export async function createProduct(input: {
  name: string;
  description: string;
  price: number;
  sale_price: number | null;
  image: string;
  category_id: number | null;
  stock: number;
}): Promise<number> {
  const db = await getDb();
  let slug = slugify(input.name);
  const [existsRows] = await db.execute("SELECT id FROM products WHERE slug = ?", [slug]);
  if ((existsRows as unknown[]).length > 0) slug = `${slug}-${Date.now().toString().slice(-5)}`;
  const [result] = await db.execute(
    `INSERT INTO products (name, slug, description, price, sale_price, image, category_id, stock)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [input.name, slug, input.description, input.price, input.sale_price, input.image, input.category_id, input.stock]
  );
  return (result as mysql.ResultSetHeader).insertId;
}

export async function updateProduct(
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
): Promise<void> {
  const db = await getDb();
  const current = await getProductById(id);
  if (!current) throw new Error("Product not found");
  const merged = { ...current, ...input };
  await db.execute(
    `UPDATE products SET name=?, description=?, price=?, sale_price=?,
     image=?, category_id=?, stock=?, is_active=? WHERE id=?`,
    [merged.name, merged.description, merged.price, merged.sale_price, merged.image, merged.category_id, merged.stock, merged.is_active, id]
  );
}

export async function deleteProduct(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM products WHERE id = ?", [id]);
}
