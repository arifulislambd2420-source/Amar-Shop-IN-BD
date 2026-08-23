import { getDb } from "./db";
import { listProductsAdmin, PRODUCT_STATUSES } from "./products";

// ---------------------------------------------------------------------------
// CSV primitives (hand-rolled, no dependency)
// ---------------------------------------------------------------------------

// Minimal RFC-4180 parser. Handles quoted fields, embedded commas/quotes/
// newlines, CRLF or LF line endings, and a leading UTF-8 BOM. Returns rows of
// raw string cells (no trimming — callers trim where needed).
export function parseCsv(input: string): string[][] {
  let text = input;
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // strip BOM
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  let started = false; // whether current row/field region has begun
  const n = text.length;
  let i = 0;
  while (i < n) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      started = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      started = true;
      i += 1;
      continue;
    }
    if (ch === "\r") {
      i += 1;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      started = false;
      i += 1;
      continue;
    }
    field += ch;
    started = true;
    i += 1;
  }
  if (started || field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function csvCell(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

function csvRow(cells: (string | number | null | undefined)[]): string {
  return cells.map(csvCell).join(",");
}

const BOM = "﻿";

export const EXPORT_COLUMNS = [
  "sku",
  "name",
  "slug",
  "status",
  "category",
  "brand",
  "regular_price",
  "sale_price",
  "stock",
  "description",
  "seo_title",
  "meta_description",
  "tags",
] as const;

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export type ExportFilters = {
  q?: string;
  categoryId?: number;
  brandId?: number;
  status?: string;
  stock?: "in" | "out";
  trashed?: boolean;
  ids?: number[];
};

export async function exportProductsCsv(filters: ExportFilters = {}): Promise<string> {
  const { rows } = await listProductsAdmin({ ...filters, page: 1, pageSize: 1000000 });
  const lines: string[] = [csvRow([...EXPORT_COLUMNS])];
  for (const p of rows) {
    lines.push(
      csvRow([
        p.sku, // stays text (quoted) — leading zeros preserved
        p.name,
        p.slug,
        p.status,
        p.category_name,
        p.brand_name,
        p.price,
        p.sale_price,
        p.stock,
        p.description,
        p.seo_title,
        p.meta_description,
        p.tags,
      ])
    );
  }
  // NOTE: cost_price and all customer/order data are intentionally excluded.
  return BOM + lines.join("\r\n") + "\r\n";
}

export function sampleTemplateCsv(): string {
  const header = csvRow([...EXPORT_COLUMNS]);
  const example = csvRow([
    "HONEY-001",
    "সুন্দরবন মধু ১kg",
    "sundarban-honey-1kg",
    "published",
    "মধু (Honey)",
    "Sundarban",
    2500,
    2300,
    20,
    "খাঁটি সুন্দরবন মধু, ১ কেজি বোতল।",
    "সুন্দরবন মধু ১ কেজি | আমারশপ",
    "খাঁটি সুন্দরবন মধু কিনুন সেরা দামে।",
    "honey,মধু,organic",
  ]);
  return BOM + header + "\r\n" + example + "\r\n";
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

// Canonical product fields an import column can map to.
export const IMPORT_FIELDS = [
  "name",
  "slug",
  "sku",
  "status",
  "category",
  "brand",
  "regular_price",
  "sale_price",
  "stock",
  "description",
  "seo_title",
  "meta_description",
  "tags",
] as const;
export type ImportField = (typeof IMPORT_FIELDS)[number];

export type ImportMode = "create_only" | "update_only" | "both" | "dry_run";

// mapping: CSV header name -> product field (or "" / "ignore" to skip)
export type ColumnMapping = Record<string, string>;

export type ImportError = { row: number; reason: string };

export type ImportCounts = { create: number; update: number; skip: number; reject: number };

export type AnalyzeResult = {
  headers: string[];
  preview: Record<string, string>[];
  counts: ImportCounts;
  errors: ImportError[];
};

const TEXT_FIELDS: ReadonlySet<string> = new Set([
  "name",
  "sku",
  "status",
  "description",
  "seo_title",
  "meta_description",
  "tags",
]);

// Formula-injection defense: neutralize cells that could be executed as a
// formula when the CSV is later opened in a spreadsheet.
function neutralizeFormula(value: string): string {
  const first = value.trimStart()[0];
  if (first === "=" || first === "+" || first === "-" || first === "@") {
    return "'" + value;
  }
  return value;
}

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9ঀ-৿]+/g, "-")
      .replace(/^-+|-+$/g, "") || `p-${Date.now()}`
  );
}

function parseNumber(raw: string): number | null {
  const s = raw.replace(/,/g, "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

type ImportContext = {
  categoryByName: Map<string, number>;
  categoryBySlug: Map<string, number>;
  brandByName: Map<string, number>;
  productBySku: Map<string, number>;
  slugToId: Map<string, number>;
};

async function loadImportContext(): Promise<ImportContext> {
  const db = await getDb();
  const [catRows] = await db.query("SELECT id, name, slug FROM categories");
  const [brandRows] = await db.query("SELECT id, name FROM brands");
  const [prodRows] = await db.query(
    "SELECT id, sku, slug FROM products WHERE deleted_at IS NULL"
  );
  const ctx: ImportContext = {
    categoryByName: new Map(),
    categoryBySlug: new Map(),
    brandByName: new Map(),
    productBySku: new Map(),
    slugToId: new Map(),
  };
  for (const c of catRows as { id: number; name: string; slug: string }[]) {
    ctx.categoryByName.set(c.name.trim().toLowerCase(), c.id);
    ctx.categoryBySlug.set(c.slug.trim().toLowerCase(), c.id);
  }
  for (const b of brandRows as { id: number; name: string }[]) {
    ctx.brandByName.set(b.name.trim().toLowerCase(), b.id);
  }
  for (const p of prodRows as { id: number; sku: string | null; slug: string }[]) {
    if (p.sku) ctx.productBySku.set(p.sku, p.id);
    ctx.slugToId.set(p.slug.toLowerCase(), p.id);
  }
  return ctx;
}

type RowAction = {
  row: number;
  type: "create" | "update";
  productId?: number;
  data: {
    name?: string;
    slug?: string;
    sku: string | null;
    status?: string;
    category_id: number | null;
    brand_id: number | null;
    price?: number;
    sale_price?: number | null;
    stock?: number;
    description?: string;
    seo_title?: string | null;
    meta_description?: string | null;
    tags?: string | null;
  };
};

type Plan = {
  headers: string[];
  preview: Record<string, string>[];
  counts: ImportCounts;
  errors: ImportError[];
  actions: RowAction[];
};

// Build the full import plan (shared by analyze + commit).
async function buildPlan(csvText: string, mapping: ColumnMapping, mode: ImportMode): Promise<Plan> {
  const table = parseCsv(csvText);
  const headers = table.length > 0 ? table[0].map((h) => h.trim()) : [];
  const dataRows = table.slice(1);

  const ctx = await loadImportContext();

  // header index -> field
  const colField: (ImportField | null)[] = headers.map((h) => {
    const f = mapping[h];
    return f && (IMPORT_FIELDS as readonly string[]).includes(f) ? (f as ImportField) : null;
  });

  const counts: ImportCounts = { create: 0, update: 0, skip: 0, reject: 0 };
  const errors: ImportError[] = [];
  const actions: RowAction[] = [];
  const preview: Record<string, string>[] = [];
  const seenSlugs = new Map<string, number>(); // slug -> row number (within file)

  for (let r = 0; r < dataRows.length; r++) {
    const rowNum = r + 2; // 1-based incl. header
    const cells = dataRows[r];
    // skip fully empty lines
    if (cells.every((c) => c.trim() === "")) continue;

    // map raw cells -> field values
    const raw: Partial<Record<ImportField, string>> = {};
    for (let c = 0; c < headers.length; c++) {
      const field = colField[c];
      if (!field) continue;
      raw[field] = (cells[c] ?? "").trim();
    }

    if (preview.length < 10) {
      const previewRow: Record<string, string> = {};
      for (const f of IMPORT_FIELDS) previewRow[f] = raw[f] ?? "";
      preview.push(previewRow);
    }

    // sanitize text fields (strip tags on name/description, neutralize formulas)
    const clean: Partial<Record<ImportField, string>> = {};
    for (const f of IMPORT_FIELDS) {
      let v = raw[f];
      if (v === undefined) continue;
      if (f === "name" || f === "description") v = stripTags(v);
      if (TEXT_FIELDS.has(f)) v = neutralizeFormula(v);
      clean[f] = v;
    }

    const name = clean.name?.trim() ?? "";
    const sku = clean.sku && clean.sku.trim() ? clean.sku.trim() : null;

    // --- classify by SKU only (never by name) ---
    const matchedId = sku ? ctx.productBySku.get(sku) : undefined;
    const isUpdate = matchedId !== undefined;

    // --- validation ---
    let reject: string | null = null;

    if (!isUpdate && name === "") reject = "নাম নেই (name is required)";

    // price
    let price: number | undefined;
    if (reject === null && raw.regular_price !== undefined && raw.regular_price !== "") {
      const p = parseNumber(raw.regular_price);
      if (p === null || Number.isNaN(p) || p < 0) reject = "অবৈধ price";
      else price = p;
    }
    if (reject === null && !isUpdate && price === undefined) {
      reject = "price নেই (price is required for new product)";
    }

    // sale_price
    let salePrice: number | null | undefined;
    if (reject === null && raw.sale_price !== undefined && raw.sale_price !== "") {
      const sp = parseNumber(raw.sale_price);
      if (sp === null || Number.isNaN(sp) || sp < 0) reject = "অবৈধ sale price";
      else salePrice = sp;
    }
    if (reject === null && salePrice !== undefined && salePrice !== null) {
      const cmp = price !== undefined ? price : undefined;
      if (cmp !== undefined && salePrice > cmp) reject = "sale price regular price এর চেয়ে বেশি";
    }

    // stock
    let stock: number | undefined;
    if (reject === null && raw.stock !== undefined && raw.stock !== "") {
      const st = parseNumber(raw.stock);
      if (st === null || Number.isNaN(st) || st < 0) reject = "অবৈধ stock";
      else stock = Math.trunc(st);
    }

    // category (unknown => reject; never auto-create)
    let categoryId: number | null = null;
    if (reject === null && raw.category !== undefined && raw.category.trim() !== "") {
      const key = raw.category.trim().toLowerCase();
      const cid = ctx.categoryByName.get(key) ?? ctx.categoryBySlug.get(key);
      if (cid === undefined) reject = `অজানা category: ${raw.category.trim()}`;
      else categoryId = cid;
    }

    // brand (lenient: unknown brand -> null, brands have no slug)
    let brandId: number | null = null;
    if (reject === null && raw.brand !== undefined && raw.brand.trim() !== "") {
      const bid = ctx.brandByName.get(raw.brand.trim().toLowerCase());
      if (bid !== undefined) brandId = bid;
    }

    // status
    let status: string | undefined;
    if (clean.status && clean.status.trim() !== "") {
      const s = clean.status.trim().toLowerCase();
      if ((PRODUCT_STATUSES as readonly string[]).includes(s)) status = s;
    }

    // slug (explicit or derived from name)
    let slug: string | undefined;
    if (reject === null) {
      if (clean.slug && clean.slug.trim() !== "") slug = slugify(clean.slug);
      else if (name !== "") slug = slugify(name);

      if (slug) {
        const dupRow = seenSlugs.get(slug);
        if (dupRow !== undefined) {
          reject = `ফাইলের মধ্যে ডুপ্লিকেট slug (row ${dupRow})`;
        } else {
          const existingId = ctx.slugToId.get(slug);
          if (existingId !== undefined && existingId !== matchedId) {
            reject = `slug অন্য একটি পণ্যের সাথে সাংঘর্ষিক: ${slug}`;
          }
        }
      }
    }

    if (reject !== null) {
      counts.reject += 1;
      errors.push({ row: rowNum, reason: reject });
      continue;
    }

    if (slug) seenSlugs.set(slug, rowNum);

    // --- mode gating ---
    const wantCreate = mode === "create_only" || mode === "both" || mode === "dry_run";
    const wantUpdate = mode === "update_only" || mode === "both" || mode === "dry_run";
    if (isUpdate && !wantUpdate) {
      counts.skip += 1;
      continue;
    }
    if (!isUpdate && !wantCreate) {
      counts.skip += 1;
      continue;
    }

    const data: RowAction["data"] = {
      sku,
      category_id: categoryId,
      brand_id: brandId,
    };
    if (name !== "") data.name = name;
    if (slug !== undefined && !isUpdate) data.slug = slug;
    if (status !== undefined) data.status = status;
    if (price !== undefined) data.price = price;
    if (salePrice !== undefined) data.sale_price = salePrice;
    if (stock !== undefined) data.stock = stock;
    if (clean.description !== undefined) data.description = clean.description;
    if (clean.seo_title !== undefined) data.seo_title = clean.seo_title || null;
    if (clean.meta_description !== undefined) data.meta_description = clean.meta_description || null;
    if (clean.tags !== undefined) data.tags = clean.tags || null;

    if (isUpdate) {
      counts.update += 1;
      actions.push({ row: rowNum, type: "update", productId: matchedId, data });
    } else {
      counts.create += 1;
      actions.push({ row: rowNum, type: "create", data });
    }
  }

  return { headers, preview, counts, errors, actions };
}

export async function analyzeImport(
  csvText: string,
  mapping: ColumnMapping,
  mode: ImportMode
): Promise<AnalyzeResult> {
  const plan = await buildPlan(csvText, mapping, mode);
  return { headers: plan.headers, preview: plan.preview, counts: plan.counts, errors: plan.errors };
}

function statusToActive(status: string | undefined): number | undefined {
  if (status === undefined) return undefined;
  return status === "published" ? 1 : 0;
}

export async function commitImport(
  csvText: string,
  mapping: ColumnMapping,
  mode: ImportMode
): Promise<AnalyzeResult> {
  const plan = await buildPlan(csvText, mapping, mode);
  const result: AnalyzeResult = {
    headers: plan.headers,
    preview: plan.preview,
    counts: plan.counts,
    errors: [...plan.errors],
  };
  if (mode === "dry_run") return result; // no writes

  const db = await getDb();
  const BATCH = 50;
  for (let start = 0; start < plan.actions.length; start += BATCH) {
    const batch = plan.actions.slice(start, start + BATCH);
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      for (const action of batch) {
        if (action.type === "create") {
          const d = action.data;
          const status = d.status || "published";
          try {
            await conn.execute(
              `INSERT INTO products
                (name, slug, description, price, sale_price, image, category_id, brand_id, stock,
                 sku, status, seo_title, meta_description, tags, is_active)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                d.name ?? "",
                d.slug ?? slugify(d.name ?? "p"),
                d.description ?? "",
                d.price ?? 0,
                d.sale_price ?? null,
                "/products/placeholder.svg",
                d.category_id,
                d.brand_id,
                d.stock ?? 0,
                d.sku,
                status,
                d.seo_title ?? null,
                d.meta_description ?? null,
                d.tags ?? null,
                statusToActive(status) ?? 0,
              ]
            );
          } catch (err) {
            recordActionError(result, action.row, err);
          }
        } else {
          const d = action.data;
          const sets: string[] = [];
          const vals: (string | number | null)[] = [];
          const put = (col: string, v: string | number | null) => {
            sets.push(`${col} = ?`);
            vals.push(v);
          };
          if (d.name !== undefined) put("name", d.name);
          if (d.description !== undefined) put("description", d.description);
          if (d.price !== undefined) put("price", d.price);
          if (d.sale_price !== undefined) put("sale_price", d.sale_price);
          if (d.stock !== undefined) put("stock", d.stock);
          if (d.category_id !== undefined) put("category_id", d.category_id);
          if (d.brand_id !== undefined) put("brand_id", d.brand_id);
          if (d.seo_title !== undefined) put("seo_title", d.seo_title);
          if (d.meta_description !== undefined) put("meta_description", d.meta_description);
          if (d.tags !== undefined) put("tags", d.tags);
          if (d.status !== undefined) {
            put("status", d.status);
            const active = statusToActive(d.status);
            if (active !== undefined) put("is_active", active);
          }
          if (sets.length === 0) continue;
          vals.push(action.productId as number);
          try {
            await conn.execute(`UPDATE products SET ${sets.join(", ")} WHERE id = ?`, vals);
          } catch (err) {
            recordActionError(result, action.row, err);
          }
        }
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      for (const action of batch) recordActionError(result, action.row, err);
    } finally {
      conn.release();
    }
  }
  return result;
}

function recordActionError(result: AnalyzeResult, row: number, err: unknown) {
  const code = (err as { code?: string }).code;
  const reason =
    code === "ER_DUP_ENTRY" ? "ডুপ্লিকেট SKU/slug (DB)" : "সংরক্ষণ ব্যর্থ (DB error)";
  result.errors.push({ row, reason });
  // move one out of create/update into reject
  if (result.counts.create > 0) result.counts.create -= 1;
  else if (result.counts.update > 0) result.counts.update -= 1;
  result.counts.reject += 1;
}
