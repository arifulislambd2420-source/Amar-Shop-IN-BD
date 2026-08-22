"use client";

import { useEffect, useState } from "react";
import { formatTaka } from "@/lib/format";
import type { Product, Category, ProductVariant } from "@/lib/types";

type Brand = { id: number; name: string; logo: string | null };

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
};

export default function ProductsAdmin({
  initialProducts,
  categories,
  brands,
}: {
  initialProducts: Product[];
  categories: Category[];
  brands: Brand[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function openNew() {
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError("");
  }

  function openEdit(p: Product) {
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
    });
    setShowForm(true);
    setError("");
  }

  async function refresh() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products);
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

  async function handleDelete(id: number) {
    if (!confirm("এই product টা delete করতে চান?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📦 Products</h1>
        <button
          onClick={openNew}
          className="bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold px-4 py-2 rounded-lg text-sm"
        >
          + Add Product
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Name *</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Category</span>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="input"
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Brand</span>
              <select
                value={form.brand_id}
                onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                className="input"
              >
                <option value="">— None —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
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
              <span className="font-medium text-gray-700">Stock *</span>
              <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Image path</span>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input" />
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
            <VariantsSection productId={form.id} />
          ) : (
            <p className="text-xs text-gray-400 mt-4">
              Product create করার পর variant যোগ করা যাবে।
            </p>
          )}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Price</th>
              <th className="py-2 px-4">Stock</th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-100">
                <td className="py-2 px-4">{p.name}</td>
                <td className="py-2 px-4">
                  {formatTaka(p.sale_price ?? p.price)}
                  {p.sale_price != null && <span className="text-gray-400 line-through ml-2 text-xs">{formatTaka(p.price)}</span>}
                </td>
                <td className="py-2 px-4">{p.stock}</td>
                <td className="py-2 px-4 text-right">
                  <button onClick={() => openEdit(p)} className="text-brand-orange font-medium mr-3">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 font-medium">Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-400">কোনো product নেই</td>
              </tr>
            )}
          </tbody>
        </table>
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
          <button
            type="button"
            onClick={startAdd}
            className="text-brand-orange text-sm font-medium"
          >
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
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setError("");
            }}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
