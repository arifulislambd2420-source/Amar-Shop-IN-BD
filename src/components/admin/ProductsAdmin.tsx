"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatTaka } from "@/lib/format";
import type { Product, Category, ProductVariant, ProductImage } from "@/lib/types";

type Brand = { id: number; name: string; logo: string | null };

type AdminRow = Product & { category_name: string | null; brand_name: string | null };

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "hidden", label: "Hidden" },
  { value: "outofstock", label: "Out of stock" },
  { value: "archived", label: "Archived" },
];

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  published: "bg-green-100 text-green-700",
  hidden: "bg-yellow-100 text-yellow-700",
  outofstock: "bg-orange-100 text-orange-700",
  archived: "bg-red-100 text-red-700",
};

type FormState = {
  id?: number;
  name: string;
  description: string;
  price: string;
  sale_price: string;
  stock: string;
  category_id: string;
  brand_id: string;
  image: string;
  sku: string;
  status: string;
  cost_price: string;
  seo_title: string;
  meta_description: string;
  tags: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  sale_price: "",
  stock: "0",
  category_id: "",
  brand_id: "",
  image: "/products/honey1.svg",
  sku: "",
  status: "published",
  cost_price: "",
  seo_title: "",
  meta_description: "",
  tags: "",
};

const PAGE_SIZE = 20;

export default function ProductsAdmin({
  initialProducts,
  initialTotal,
  categories,
  brands,
}: {
  initialProducts: AdminRow[];
  initialTotal: number;
  categories: Category[];
  brands: Brand[];
}) {
  const [products, setProducts] = useState<AdminRow[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // filters
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [trashed, setTrashed] = useState(false);
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkAmount, setBulkAmount] = useState("");
  const [bulkMode, setBulkMode] = useState<"fixed" | "percent">("fixed");

  const buildQuery = useCallback(
    (extra?: Record<string, string>) => {
      const p = new URLSearchParams();
      if (q.trim()) p.set("q", q.trim());
      if (categoryId) p.set("categoryId", categoryId);
      if (brandId) p.set("brandId", brandId);
      if (statusFilter) p.set("status", statusFilter);
      if (stockFilter) p.set("stock", stockFilter);
      if (trashed) p.set("trashed", "1");
      p.set("page", String(page));
      p.set("pageSize", String(PAGE_SIZE));
      if (extra) for (const [k, v] of Object.entries(extra)) p.set(k, v);
      return p.toString();
    },
    [q, categoryId, brandId, statusFilter, stockFilter, trashed, page]
  );

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/admin/products?${buildQuery()}`);
    const data = await res.json();
    setProducts(data.products || []);
    setTotal(data.total || 0);
    setSelected(new Set());
  }, [buildQuery]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function openNew() {
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError("");
  }

  function openEdit(p: AdminRow) {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description,
      price: String(p.price),
      sale_price: p.sale_price != null ? String(p.sale_price) : "",
      stock: String(p.stock),
      category_id: p.category_id != null ? String(p.category_id) : "",
      brand_id: p.brand_id != null ? String(p.brand_id) : "",
      image: p.image,
      sku: p.sku ?? "",
      status: p.status || "published",
      cost_price: p.cost_price != null ? String(p.cost_price) : "",
      seo_title: p.seo_title ?? "",
      meta_description: p.meta_description ?? "",
      tags: p.tags ?? "",
    });
    setShowForm(true);
    setError("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      stock: parseInt(form.stock, 10) || 0,
      category_id: form.category_id ? parseInt(form.category_id, 10) : null,
      brand_id: form.brand_id ? parseInt(form.brand_id, 10) : null,
      image: form.image || "/products/honey1.svg",
      sku: form.sku.trim() ? form.sku.trim() : null,
      status: form.status,
      cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
      seo_title: form.seo_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
      tags: form.tags.trim() || null,
    };
    try {
      const res = form.id
        ? await fetch(`/api/admin/products/${form.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/admin/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "সংরক্ষণ করা যায়নি");
        setSaving(false);
        return;
      }
      await refresh();
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch {
      setError("নেটওয়ার্ক সমস্যা");
    } finally {
      setSaving(false);
    }
  }

  async function handleTrash(id: number) {
    if (!confirm("এই product টা trash এ পাঠাতে চান?")) return;
    await fetch(`/api/admin/products/${id}/trash`, { method: "POST" });
    await refresh();
  }

  async function handleRestore(id: number) {
    await fetch(`/api/admin/products/${id}/restore`, { method: "POST" });
    await refresh();
  }

  async function handlePermanentDelete(id: number) {
    if (!confirm("স্থায়ীভাবে delete করবেন? এটি ফেরানো যাবে না।")) return;
    await fetch(`/api/admin/products/${id}?permanent=1`, { method: "DELETE" });
    await refresh();
  }

  async function handleDuplicate(id: number) {
    await fetch(`/api/admin/products/${id}/duplicate`, { method: "POST" });
    await refresh();
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => {
      if (prev.size === products.length) return new Set();
      return new Set(products.map((p) => p.id));
    });
  }

  async function runBulk(action: string, payload?: Record<string, unknown>) {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const res = await fetch(`/api/admin/products/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, action, payload: payload || {} }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Bulk action ব্যর্থ");
      return;
    }
    await refresh();
  }

  function exportSelected() {
    const ids = Array.from(selected);
    const query = ids.length > 0 ? buildQuery({ ids: ids.join(",") }) : buildQuery();
    window.open(`/api/admin/products/export?${query}`, "_blank");
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📦 Products</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/products/import"
            className="border border-gray-300 hover:bg-gray-50 font-semibold px-4 py-2 rounded-lg text-sm"
          >
            Import / Export
          </Link>
          <button
            onClick={openNew}
            className="bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold px-4 py-2 rounded-lg text-sm"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                refresh();
              }
            }}
            placeholder="নাম বা SKU"
            className="input"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Category</span>
          <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }} className="input">
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Brand</span>
          <select value={brandId} onChange={(e) => { setBrandId(e.target.value); setPage(1); }} className="input">
            <option value="">All</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Status</span>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input">
            <option value="">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Stock</span>
          <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setPage(1); }} className="input">
            <option value="">All</option>
            <option value="in">In stock</option>
            <option value="out">Out of stock</option>
          </select>
        </label>
        <button
          onClick={() => { setPage(1); refresh(); }}
          className="bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Apply
        </button>
        <button
          onClick={() => {
            setTrashed((t) => !t);
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium border ${trashed ? "bg-red-50 border-red-300 text-red-600" : "border-gray-300"}`}
        >
          {trashed ? "← Back to Products" : "🗑️ Trash"}
        </button>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && !trashed && (
        <div className="bg-brand-navy/5 border border-brand-navy/20 rounded-xl p-3 mb-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">{selected.size} selected</span>
          <button onClick={() => runBulk("set_status", { status: "published" })} className="border border-gray-300 bg-white px-3 py-1.5 rounded-lg">Publish</button>
          <button onClick={() => runBulk("set_status", { status: "draft" })} className="border border-gray-300 bg-white px-3 py-1.5 rounded-lg">Draft</button>
          <button onClick={() => runBulk("set_status", { status: "archived" })} className="border border-gray-300 bg-white px-3 py-1.5 rounded-lg">Archive</button>
          <button onClick={() => runBulk("trash")} className="border border-red-300 text-red-600 bg-white px-3 py-1.5 rounded-lg">Trash</button>
          <span className="mx-1 h-5 w-px bg-gray-300" />
          <select value={bulkMode} onChange={(e) => setBulkMode(e.target.value as "fixed" | "percent")} className="input py-1.5">
            <option value="fixed">৳ Fixed</option>
            <option value="percent">% Percent</option>
          </select>
          <input
            value={bulkAmount}
            onChange={(e) => setBulkAmount(e.target.value)}
            placeholder="+/- amount"
            className="input py-1.5 w-28"
            type="number"
            step="0.01"
          />
          <button
            onClick={() => {
              const amount = parseFloat(bulkAmount);
              if (Number.isNaN(amount)) { alert("সঠিক পরিমাণ দিন"); return; }
              runBulk("price_adjust", { mode: bulkMode, amount });
            }}
            className="bg-brand-orange text-white px-3 py-1.5 rounded-lg font-medium"
          >
            Update Price
          </button>
          <button onClick={exportSelected} className="border border-gray-300 bg-white px-3 py-1.5 rounded-lg">Export selected</button>
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Name *</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">SKU</span>
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Category</span>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input">
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Brand</span>
              <select value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })} className="input">
                <option value="">— None —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Status</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Price (৳) *</span>
              <input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Sale Price (৳)</span>
              <input type="number" step="0.01" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Cost Price (৳)</span>
              <input type="number" step="0.01" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Stock *</span>
              <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Image path</span>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">SEO Title</span>
              <input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Tags (comma separated)</span>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm md:col-span-2">
              <span className="font-medium text-gray-700">Meta Description</span>
              <textarea rows={2} value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm md:col-span-2">
              <span className="font-medium text-gray-700">Description</span>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
            </label>
            {error && <p className="text-red-600 text-sm md:col-span-2">{error}</p>}
            <div className="md:col-span-2 flex gap-3">
              <button disabled={saving} className="bg-brand-orange text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-60">
                {saving ? "Saving..." : form.id ? "Update Product" : "Create Product"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-gray-300 px-4 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </form>

          {form.id ? (
            <>
              <VariantsSection productId={form.id} />
              <GallerySection productId={form.id} />
            </>
          ) : (
            <p className="text-xs text-gray-400 mt-4">
              Product create করার পর variant ও gallery image যোগ করা যাবে।
            </p>
          )}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 px-3">
                <input type="checkbox" checked={products.length > 0 && selected.size === products.length} onChange={toggleSelectAll} />
              </th>
              <th className="py-2 px-3">Image</th>
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3">SKU</th>
              <th className="py-2 px-3">Category</th>
              <th className="py-2 px-3">Brand</th>
              <th className="py-2 px-3">Price</th>
              <th className="py-2 px-3">Stock</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Updated</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-100">
                <td className="py-2 px-3">
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} />
                </td>
                <td className="py-2 px-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover bg-gray-50" />
                </td>
                <td className="py-2 px-3 max-w-[220px] truncate">{p.name}</td>
                <td className="py-2 px-3 text-gray-500">{p.sku || "—"}</td>
                <td className="py-2 px-3 text-gray-500">{p.category_name || "—"}</td>
                <td className="py-2 px-3 text-gray-500">{p.brand_name || "—"}</td>
                <td className="py-2 px-3 whitespace-nowrap">
                  {formatTaka(p.sale_price ?? p.price)}
                  {p.sale_price != null && <span className="text-gray-400 line-through ml-1 text-xs">{formatTaka(p.price)}</span>}
                </td>
                <td className="py-2 px-3">{p.stock}</td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[p.status] || "bg-gray-100 text-gray-600"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-2 px-3 text-gray-400 text-xs whitespace-nowrap">{(p.updated_at || "").slice(0, 16)}</td>
                <td className="py-2 px-3 text-right whitespace-nowrap">
                  {trashed ? (
                    <>
                      <button onClick={() => handleRestore(p.id)} className="text-green-600 font-medium mr-3">Restore</button>
                      <button onClick={() => handlePermanentDelete(p.id)} className="text-red-500 font-medium">Delete</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => openEdit(p)} className="text-brand-orange font-medium mr-3">Edit</button>
                      <button onClick={() => handleDuplicate(p.id)} className="text-brand-navy font-medium mr-3">Duplicate</button>
                      <button onClick={() => handleTrash(p.id)} className="text-red-500 font-medium">Trash</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={11} className="py-4 text-center text-gray-400">কোনো product নেই</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <span>মোট {total} টি পণ্য</span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((n) => Math.max(1, n - 1))}
            className="border border-gray-300 px-3 py-1.5 rounded-lg disabled:opacity-50"
          >
            ← Prev
          </button>
          <span>Page {page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((n) => Math.min(totalPages, n + 1))}
            className="border border-gray-300 px-3 py-1.5 rounded-lg disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

type VariantFormState = { label: string; price: string; stock: string };
const EMPTY_VARIANT_FORM: VariantFormState = { label: "", price: "", stock: "0" };

function VariantsSection({ productId }: { productId: number }) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<VariantFormState>(EMPTY_VARIANT_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/products/${productId}/variants`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setVariants(data.variants || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  function startAdd() {
    setForm(EMPTY_VARIANT_FORM);
    setEditingId("new");
    setError("");
  }

  function startEdit(v: ProductVariant) {
    setForm({ label: v.label, price: String(v.price), stock: String(v.stock) });
    setEditingId(v.id);
    setError("");
  }

  async function handleSaveVariant(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      label: form.label,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10) || 0,
    };
    try {
      const res =
        editingId === "new"
          ? await fetch(`/api/admin/products/${productId}/variants`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/products/${productId}/variants/${editingId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "সংরক্ষণ করা যায়নি");
        setSaving(false);
        return;
      }
      const refreshed = await fetch(`/api/admin/products/${productId}/variants`).then((r) => r.json());
      setVariants(refreshed.variants || []);
      setEditingId(null);
      setForm(EMPTY_VARIANT_FORM);
    } catch {
      setError("নেটওয়ার্ক সমস্যা");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteVariant(id: number) {
    if (!confirm("এই variant টা delete করতে চান?")) return;
    await fetch(`/api/admin/products/${productId}/variants/${id}`, { method: "DELETE" });
    setVariants((prev) => prev.filter((v) => v.id !== id));
  }

  return (
    <div className="mt-6 border-t border-gray-100 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700 text-sm">Variants</h3>
        {editingId === null && (
          <button type="button" onClick={startAdd} className="text-brand-orange text-sm font-medium">
            + Add Variant
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <table className="w-full text-sm mb-3">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-1.5 pr-4">Label</th>
              <th className="py-1.5 pr-4">Price</th>
              <th className="py-1.5 pr-4">Stock</th>
              <th className="py-1.5"></th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id} className="border-b border-gray-100">
                <td className="py-1.5 pr-4">{v.label}</td>
                <td className="py-1.5 pr-4">{formatTaka(v.price)}</td>
                <td className="py-1.5 pr-4">{v.stock}</td>
                <td className="py-1.5 text-right whitespace-nowrap">
                  <button type="button" onClick={() => startEdit(v)} className="text-brand-orange font-medium mr-3">Edit</button>
                  <button type="button" onClick={() => handleDeleteVariant(v.id)} className="text-red-500 font-medium">Delete</button>
                </td>
              </tr>
            ))}
            {variants.length === 0 && (
              <tr>
                <td colSpan={4} className="py-2 text-center text-gray-400">কোনো variant নেই</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {editingId !== null && (
        <form onSubmit={handleSaveVariant} className="flex flex-wrap items-end gap-3 bg-gray-50 rounded-lg p-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">Label *</span>
            <input required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="input" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">Price (৳) *</span>
            <input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">Stock *</span>
            <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input" />
          </label>
          {error && <p className="text-red-600 text-sm w-full">{error}</p>}
          <button disabled={saving} className="bg-brand-orange text-white font-semibold px-3 py-2 rounded-lg text-sm disabled:opacity-60">
            {saving ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={() => { setEditingId(null); setError(""); }} className="border border-gray-300 px-3 py-2 rounded-lg text-sm">
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

function GallerySection({ productId }: { productId: number }) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetch(`/api/admin/products/${productId}/images`).then((r) => r.json());
    setImages(data.images || []);
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  async function addImage(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!url.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/admin/products/${productId}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.trim(), alt: alt.trim() || null }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "যোগ করা যায়নি");
      return;
    }
    setUrl("");
    setAlt("");
    await load();
  }

  async function removeImage(id: number) {
    await fetch(`/api/admin/products/${productId}/images/${id}`, { method: "DELETE" });
    await load();
  }

  async function move(index: number, dir: -1 | 1) {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next);
    await fetch(`/api/admin/products/${productId}/images`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: next.map((i) => i.id) }),
    });
  }

  return (
    <div className="mt-6 border-t border-gray-100 pt-4">
      <h3 className="font-semibold text-gray-700 text-sm mb-3">Gallery Images</h3>
      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <div className="space-y-2 mb-3">
          {images.map((img, i) => (
            <div key={img.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt || ""} className="w-12 h-12 rounded object-cover bg-white" />
              <span className="flex-1 text-sm truncate">{img.url}</span>
              <span className="text-xs text-gray-400 truncate max-w-[120px]">{img.alt}</span>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-500 disabled:opacity-30 px-1">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="text-gray-500 disabled:opacity-30 px-1">↓</button>
              <button type="button" onClick={() => removeImage(img.id)} className="text-red-500 font-medium text-sm">Remove</button>
            </div>
          ))}
          {images.length === 0 && <p className="text-sm text-gray-400">কোনো gallery image নেই</p>}
        </div>
      )}
      <form onSubmit={addImage} className="flex flex-wrap items-end gap-3 bg-gray-50 rounded-lg p-3">
        <label className="flex flex-col gap-1 text-sm flex-1 min-w-[200px]">
          <span className="font-medium text-gray-700">Image URL *</span>
          <input value={url} onChange={(e) => setUrl(e.target.value)} className="input" placeholder="/products/... or https://..." />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Alt</span>
          <input value={alt} onChange={(e) => setAlt(e.target.value)} className="input" />
        </label>
        {error && <p className="text-red-600 text-sm w-full">{error}</p>}
        <button disabled={saving} className="bg-brand-orange text-white font-semibold px-3 py-2 rounded-lg text-sm disabled:opacity-60">
          {saving ? "..." : "Add Image"}
        </button>
      </form>
    </div>
  );
}
