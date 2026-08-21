"use client";

import { useState } from "react";
import { formatTaka } from "@/lib/format";
import type { Product, Category } from "@/lib/types";

type FormState = {
  id?: number;
  name: string;
  description: string;
  price: string;
  sale_price: string;
  stock: string;
  category_id: string;
  image: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  sale_price: "",
  stock: "0",
  category_id: "",
  image: "/products/honey1.svg",
};

export default function ProductsAdmin({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: Category[];
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
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl p-5 mb-6 grid md:grid-cols-2 gap-4">
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
