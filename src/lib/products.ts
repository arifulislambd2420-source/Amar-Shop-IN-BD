import mysql from "mysql2/promise";
import { getDb } from "./db";
import type { Product, Category, ProductVariant, ProductImage } from "./types";

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
  let sql = `SELECT p.* FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.deleted_at IS NULL`;
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
    "SELECT * FROM products WHERE is_active = 1 AND deleted_at IS NULL AND name LIKE ? ORDER BY created_at DESC LIMIT ?",
    [term, limit]
  );
  return rows as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const db = await getDb();
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {}
  const [rows] = await db.execute(
    "SELECT * FROM products WHERE (slug = ? OR slug = ?) AND deleted_at IS NULL",
    [slug, decoded]
  );
  return (rows as Product[])[0];
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const db = await getDb();
  const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [id]);
  return (rows as Product[])[0];
}

export async function getProductVariants(productId: number): Promise<ProductVariant[]> {
  const db = await getDb();
  const [rows] = await db.execute(
    "SELECT * FROM product_variants WHERE product_id = ? ORDER BY price ASC",
    [productId]
  );
  return rows as ProductVariant[];
}

export async function createProductVariant(input: {
  product_id: number;
  label: string;
  price: number;
  stock: number;
}): Promise<number> {
  const db = await getDb();
  const [result] = await db.execute(
    "INSERT INTO product_variants (product_id, label, price, stock) VALUES (?, ?, ?, ?)",
    [input.product_id, input.label, input.price, input.stock]
  );
  return (result as mysql.ResultSetHeader).insertId;
}

export async function getProductVariantById(
  productId: number,
  variantId: number
): Promise<ProductVariant | undefined> {
  const db = await getDb();
  const [rows] = await db.execute(
    "SELECT * FROM product_variants WHERE id = ? AND product_id = ?",
    [variantId, productId]
  );
  return (rows as ProductVariant[])[0];
}

export async function updateProductVariant(
  productId: number,
  variantId: number,
  input: Partial<{ label: string; price: number; stock: number }>
): Promise<void> {
  const db = await getDb();
  const current = await getProductVariantById(productId, variantId);
  if (!current) throw new Error("Variant not found");
  const merged = { ...current, ...input };
  await db.execute(
    "UPDATE product_variants SET label=?, price=?, stock=? WHERE id=? AND product_id=?",
    [merged.label, merged.price, merged.stock, variantId, productId]
  );
}

export async function deleteProductVariant(productId: number, variantId: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM product_variants WHERE id = ? AND product_id = ?", [variantId, productId]);
}

export async function featuredProducts(limit = 8): Promise<Product[]> {
  const db = await getDb();
  const [rows] = await db.query("SELECT * FROM products WHERE is_active = 1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT ?", [limit]);
  return rows as Product[];
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ঀ-৿]+/g, "-")
    .replace(/^-+|-+$/g, "") || `p-${Date.now()}`;
}

export const PRODUCT_STATUSES = ["draft", "published", "hidden", "outofstock", "archived"] as const;
export type ProductStatusValue = (typeof PRODUCT_STATUSES)[number];

function isActiveFromStatus(status: string): number {
  return status === "published" ? 1 : 0;
}

const DUPLICATE_SKU_MESSAGE = "এই SKU দিয়ে ইতিমধ্যে একটি পণ্য আছে";

function isDuplicateSkuError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: string }).code === "ER_DUP_ENTRY" &&
    String((err as { message?: string }).message || "").includes("idx_products_sku")
  );
}

export async function createProduct(input: {
  name: string;
  description: string;
  price: number;
  sale_price: number | null;
  image: string;
  category_id: number | null;
  brand_id?: number | null;
  stock: number;
  sku?: string | null;
  status?: string;
  cost_price?: number | null;
  seo_title?: string | null;
  meta_description?: string | null;
  tags?: string | null;
}): Promise<number> {
  const db = await getDb();
  let slug = slugify(input.name);
  const [existsRows] = await db.execute("SELECT id FROM products WHERE slug = ?", [slug]);
  if ((existsRows as unknown[]).length > 0) slug = `${slug}-${Date.now().toString().slice(-5)}`;
  const sku = input.sku && input.sku.trim() ? input.sku.trim() : null;
  if (sku) {
    const [dupRows] = await db.execute("SELECT id FROM products WHERE sku = ?", [sku]);
    if ((dupRows as unknown[]).length > 0) throw new Error(DUPLICATE_SKU_MESSAGE);
  }
  const status = input.status || "published";
  try {
    const [result] = await db.execute(
      `INSERT INTO products
        (name, slug, description, price, sale_price, image, category_id, brand_id, stock,
         sku, status, cost_price, seo_title, meta_description, tags, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.name, slug, input.description, input.price, input.sale_price, input.image,
        input.category_id, input.brand_id ?? null, input.stock,
        sku, status, input.cost_price ?? null, input.seo_title ?? null,
        input.meta_description ?? null, input.tags ?? null, isActiveFromStatus(status),
      ]
    );
    return (result as mysql.ResultSetHeader).insertId;
  } catch (err) {
    if (isDuplicateSkuError(err)) throw new Error(DUPLICATE_SKU_MESSAGE);
    throw err;
  }
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
    brand_id: number | null;
    stock: number;
    is_active: number;
    sku: string | null;
    status: string;
    cost_price: number | null;
    seo_title: string | null;
    meta_description: string | null;
    tags: string | null;
  }>
): Promise<void> {
  const db = await getDb();
  const current = await getProductById(id);
  if (!current) throw new Error("Product not found");
  const merged = { ...current, ...input };
  const sku = merged.sku && String(merged.sku).trim() ? String(merged.sku).trim() : null;
  if (sku) {
    const [dupRows] = await db.execute("SELECT id FROM products WHERE sku = ? AND id <> ?", [sku, id]);
    if ((dupRows as unknown[]).length > 0) throw new Error(DUPLICATE_SKU_MESSAGE);
  }
  // is_active follows status so existing code paths stay consistent
  const isActive = "status" in input ? isActiveFromStatus(merged.status) : merged.is_active;
  try {
    await db.execute(
      `UPDATE products SET name=?, description=?, price=?, sale_price=?,
       image=?, category_id=?, brand_id=?, stock=?, is_active=?,
       sku=?, status=?, cost_price=?, seo_title=?, meta_description=?, tags=? WHERE id=?`,
      [
        merged.name, merged.description, merged.price, merged.sale_price, merged.image,
        merged.category_id, merged.brand_id, merged.stock, isActive,
        sku, merged.status, merged.cost_price ?? null, merged.seo_title ?? null,
        merged.meta_description ?? null, merged.tags ?? null, id,
      ]
    );
  } catch (err) {
    if (isDuplicateSkuError(err)) throw new Error(DUPLICATE_SKU_MESSAGE);
    throw err;
  }
}

// Real DELETE — only use from the trash flow (deleteProductPermanent). Kept for compatibility.
export async function deleteProduct(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM products WHERE id = ?", [id]);
}

export type AdminProductRow = Product & {
  category_name: string | null;
  brand_name: string | null;
};

export async function listProductsAdmin(opts: {
  q?: string;
  categoryId?: number;
  brandId?: number;
  status?: string;
  stock?: "in" | "out";
  trashed?: boolean;
  ids?: number[];
  page?: number;
  pageSize?: number;
} = {}): Promise<{ rows: AdminProductRow[]; total: number }> {
  const db = await getDb();
  const where: string[] = [];
  const params: (string | number)[] = [];
  where.push(opts.trashed ? "p.deleted_at IS NOT NULL" : "p.deleted_at IS NULL");
  if (opts.ids && opts.ids.length > 0) {
    const clean = opts.ids.filter((n) => Number.isInteger(n) && n > 0);
    if (clean.length > 0) {
      where.push(`p.id IN (${clean.map(() => "?").join(",")})`);
      params.push(...clean);
    }
  }
  if (opts.q && opts.q.trim()) {
    where.push("(p.name LIKE ? OR p.sku LIKE ?)");
    const term = `%${opts.q.trim()}%`;
    params.push(term, term);
  }
  if (opts.categoryId) {
    where.push("p.category_id = ?");
    params.push(opts.categoryId);
  }
  if (opts.brandId) {
    where.push("p.brand_id = ?");
    params.push(opts.brandId);
  }
  if (opts.status) {
    where.push("p.status = ?");
    params.push(opts.status);
  }
  if (opts.stock === "in") where.push("p.stock > 0");
  if (opts.stock === "out") where.push("p.stock = 0");
  const whereSql = `WHERE ${where.join(" AND ")}`;

  const [countRows] = await db.execute(
    `SELECT COUNT(*) AS c FROM products p ${whereSql}`,
    params
  );
  const total = (countRows as { c: number }[])[0].c;

  const pageSize = opts.pageSize && opts.pageSize > 0 ? opts.pageSize : 20;
  const page = Math.max(1, opts.page || 1);
  const listParams = [...params, pageSize, (page - 1) * pageSize];
  const [rows] = await db.execute(
    `SELECT p.*, c.name AS category_name, b.name AS brand_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN brands b ON b.id = p.brand_id
     ${whereSql}
     ORDER BY p.updated_at DESC, p.id DESC
     LIMIT ? OFFSET ?`,
    listParams
  );
  return { rows: rows as AdminProductRow[], total };
}

export async function duplicateProduct(id: number): Promise<number> {
  const db = await getDb();
  const src = await getProductById(id);
  if (!src) throw new Error("Product not found");
  const baseSlug = `${src.slug}-copy`;
  let slug = baseSlug;
  let n = 2;
  // avoid slug collision
  let taken = true;
  while (taken) {
    const [existsRows] = await db.execute("SELECT id FROM products WHERE slug = ?", [slug]);
    taken = (existsRows as unknown[]).length > 0;
    if (taken) {
      slug = `${baseSlug}-${n}`;
      n += 1;
    }
  }
  const [result] = await db.execute(
    `INSERT INTO products
      (name, slug, description, price, sale_price, image, category_id, brand_id, stock,
       sku, status, cost_price, seo_title, meta_description, tags, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, 0)`,
    [
      `${src.name} (Copy)`, slug, src.description, src.price, src.sale_price, src.image,
      src.category_id, src.brand_id, src.stock,
      null, src.cost_price, src.seo_title, src.meta_description, src.tags,
    ]
  );
  const newId = (result as mysql.ResultSetHeader).insertId;
  // copy variants
  await db.execute(
    `INSERT INTO product_variants (product_id, label, price, stock)
     SELECT ?, label, price, stock FROM product_variants WHERE product_id = ?`,
    [newId, id]
  );
  // copy gallery images
  await db.execute(
    `INSERT INTO product_images (product_id, url, alt, sort_order)
     SELECT ?, url, alt, sort_order FROM product_images WHERE product_id = ?`,
    [newId, id]
  );
  return newId;
}

export async function trashProduct(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE products SET deleted_at = NOW() WHERE id = ?", [id]);
}

export async function restoreProduct(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE products SET deleted_at = NULL WHERE id = ?", [id]);
}

export async function deleteProductPermanent(id: number): Promise<void> {
  const db = await getDb();
  // only permanently delete rows already in trash
  await db.execute("DELETE FROM products WHERE id = ? AND deleted_at IS NOT NULL", [id]);
}

export async function bulkUpdateProducts(
  ids: number[],
  action: "set_status" | "trash" | "price_adjust",
  payload: { status?: string; mode?: "fixed" | "percent"; amount?: number } = {}
): Promise<number> {
  const cleanIds = ids.filter((n) => Number.isInteger(n) && n > 0);
  if (cleanIds.length === 0) throw new Error("কোনো পণ্য নির্বাচন করা হয়নি");
  const db = await getDb();
  const conn = await db.getConnection();
  const placeholders = cleanIds.map(() => "?").join(",");
  try {
    await conn.beginTransaction();
    let affected = 0;
    if (action === "set_status") {
      const status = payload.status || "";
      if (!PRODUCT_STATUSES.includes(status as ProductStatusValue)) {
        throw new Error("অবৈধ স্ট্যাটাস");
      }
      const [res] = await conn.execute(
        `UPDATE products SET status = ?, is_active = ? WHERE id IN (${placeholders})`,
        [status, isActiveFromStatus(status), ...cleanIds]
      );
      affected = (res as mysql.ResultSetHeader).affectedRows;
    } else if (action === "trash") {
      const [res] = await conn.execute(
        `UPDATE products SET deleted_at = NOW() WHERE id IN (${placeholders})`,
        cleanIds
      );
      affected = (res as mysql.ResultSetHeader).affectedRows;
    } else if (action === "price_adjust") {
      const amount = Number(payload.amount);
      if (!Number.isFinite(amount)) throw new Error("অবৈধ পরিমাণ");
      const sql =
        payload.mode === "percent"
          ? `UPDATE products SET price = GREATEST(0, ROUND(price + (price * ? / 100), 2)) WHERE id IN (${placeholders})`
          : `UPDATE products SET price = GREATEST(0, ROUND(price + ?, 2)) WHERE id IN (${placeholders})`;
      const [res] = await conn.execute(sql, [amount, ...cleanIds]);
      affected = (res as mysql.ResultSetHeader).affectedRows;
    } else {
      throw new Error("অবৈধ অ্যাকশন");
    }
    await conn.commit();
    return affected;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function listProductImages(productId: number): Promise<ProductImage[]> {
  const db = await getDb();
  const [rows] = await db.execute(
    "SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC",
    [productId]
  );
  return rows as ProductImage[];
}

export async function addProductImage(
  productId: number,
  url: string,
  alt: string | null
): Promise<number> {
  const db = await getDb();
  const [maxRows] = await db.execute(
    "SELECT COALESCE(MAX(sort_order), -1) AS m FROM product_images WHERE product_id = ?",
    [productId]
  );
  const next = (maxRows as { m: number }[])[0].m + 1;
  const [result] = await db.execute(
    "INSERT INTO product_images (product_id, url, alt, sort_order) VALUES (?, ?, ?, ?)",
    [productId, url, alt, next]
  );
  return (result as mysql.ResultSetHeader).insertId;
}

export async function deleteProductImage(productId: number, imageId: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM product_images WHERE id = ? AND product_id = ?", [imageId, productId]);
}

export async function reorderProductImages(productId: number, orderedIds: number[]): Promise<void> {
  const clean = orderedIds.filter((n) => Number.isInteger(n) && n > 0);
  if (clean.length === 0) return;
  const db = await getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (let i = 0; i < clean.length; i++) {
      await conn.execute(
        "UPDATE product_images SET sort_order = ? WHERE id = ? AND product_id = ?",
        [i, clean[i], productId]
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export type Review = {
  id: number;
  product_id: number;
  customer_name: string;
  rating: number;
  comment: string;
  approved: number;
  created_at: string;
};

export async function getProductReviews(productId: number, approvedOnly = true): Promise<Review[]> {
  const db = await getDb();
  let sql = "SELECT * FROM reviews WHERE product_id = ?";
  const params: any[] = [productId];
  if (approvedOnly) {
    sql += " AND approved = 1";
  }
  sql += " ORDER BY created_at DESC";
  const [rows] = await db.execute(sql, params);
  return rows as Review[];
}

