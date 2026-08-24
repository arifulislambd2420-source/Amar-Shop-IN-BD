"use client";

import { useState } from "react";
import type { Category } from "@/lib/types";
import ImageUploader from "./ImageUploader";

type FormState = { id?: number; name: string; icon: string };
const EMPTY: FormState = { name: "", icon: "" };

function isImageIcon(icon: string | null) {
  return !!icon && /^(https?:\/\/|\/)/.test(icon);
}

export default function CategoriesAdmin({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function openNew() {
    setForm(EMPTY);
    setShowForm(true);
    setError("");
  }
  function openEdit(c: Category) {
    setForm({ id: c.id, name: c.name, icon: c.icon || "" });
    setShowForm(true);
    setError("");
  }

  async function refresh() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("নাম দিন");
      return;
    }
    setSaving(true);
    const payload = { name: form.name, icon: form.icon || null };
    try {
      const res = form.id
        ? await fetch(`/api/admin/categories/${form.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/admin/categories`, {
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
      setForm(EMPTY);
    } catch {
      setError("নেটওয়ার্ক সমস্যা");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("এই category মুছে ফেলবেন? এর পণ্যগুলো category ছাড়া হয়ে যাবে।")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🗂️ Categories</h1>
        <button
          onClick={openNew}
          className="bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold px-4 py-2 rounded-lg text-sm"
        >
          + Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 max-w-xl">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Name *</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Icon / Image</span>
              <ImageUploader value={form.icon} onChange={(url) => setForm({ ...form, icon: url })} />
              <span className="text-xs text-gray-400">Upload a square icon (recommended), or leave blank for a default.</span>
            </label>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button disabled={saving} className="bg-brand-orange text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-60">
                {saving ? "Saving..." : form.id ? "Update Category" : "Create Category"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-gray-300 px-4 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 px-4">Icon</th>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Slug</th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-gray-100">
                <td className="py-2 px-4">
                  {isImageIcon(c.icon) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.icon!} alt="" className="h-8 w-8 object-contain rounded" />
                  ) : (
                    <span className="text-xl">{c.icon || "🗂️"}</span>
                  )}
                </td>
                <td className="py-2 px-4 font-medium">{c.name}</td>
                <td className="py-2 px-4 text-gray-500">{c.slug}</td>
                <td className="py-2 px-4 text-right">
                  <button onClick={() => openEdit(c)} className="text-brand-orange font-medium mr-3">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-500 font-medium">Delete</button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-400">কোনো category নেই</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
