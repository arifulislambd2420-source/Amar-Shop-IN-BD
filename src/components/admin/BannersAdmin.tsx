"use client";

import { useState } from "react";
import type { Banner } from "@/lib/types";
import ImageUploader from "./ImageUploader";

type FormState = {
  id?: number;
  image: string;
  link: string;
  position: "hero" | "side" | "promo";
  sort_order: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  image: "",
  link: "",
  position: "hero",
  sort_order: "0",
  active: true,
};

export default function BannersAdmin({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function openNew() {
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError("");
  }

  function openEdit(b: Banner) {
    setForm({
      id: b.id,
      image: b.image,
      link: b.link || "",
      position: b.position as "hero" | "side" | "promo",
      sort_order: String(b.sort_order),
      active: !!b.active,
    });
    setShowForm(true);
    setError("");
  }

  async function refresh() {
    const res = await fetch("/api/admin/banners");
    const data = await res.json();
    setBanners(data.banners);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.image.trim()) {
      setError("একটি banner image আপলোড করুন বা URL দিন।");
      return;
    }
    setSaving(true);
    const payload = {
      image: form.image,
      link: form.link || null,
      position: form.position,
      sort_order: parseInt(form.sort_order, 10) || 0,
      active: form.active ? 1 : 0,
    };
    try {
      const res = form.id
        ? await fetch(`/api/admin/banners/${form.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/admin/banners`, {
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
    if (!confirm("এই banner টা delete করতে চান?")) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🖼️ Banner & Ads</h1>
        <button
          onClick={openNew}
          className="bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold px-4 py-2 rounded-lg text-sm"
        >
          + Add Banner
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm md:col-span-2">
              <span className="font-medium text-gray-700">Banner Image *</span>
              <ImageUploader value={form.image} onChange={(url) => setForm({ ...form, image: url })} />
              <span className="text-xs text-gray-400">
                Recommended ~1200×525 (16:7). Upload a file, or paste a direct image URL.
              </span>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Link</span>
              <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Position *</span>
              <select
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value as FormState["position"] })}
                className="input"
              >
                <option value="hero">hero</option>
                <option value="side">side</option>
                <option value="promo">promo</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Sort order *</span>
              <input required type="number" min={0} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="input" />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <span className="font-medium text-gray-700">Active</span>
            </label>
            {error && <p className="text-red-600 text-sm md:col-span-2">{error}</p>}
            <div className="md:col-span-2 flex gap-3">
              <button disabled={saving} className="bg-brand-orange text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-60">
                {saving ? "Saving..." : form.id ? "Update Banner" : "Create Banner"}
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
              <th className="py-2 px-4">Image</th>
              <th className="py-2 px-4">Position</th>
              <th className="py-2 px-4">Link</th>
              <th className="py-2 px-4">Sort</th>
              <th className="py-2 px-4">Active</th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {banners.map((b) => (
              <tr key={b.id} className="border-b border-gray-100">
                <td className="py-2 px-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.image} alt="" className="h-10 w-16 object-cover rounded" />
                </td>
                <td className="py-2 px-4">{b.position}</td>
                <td className="py-2 px-4 max-w-[200px] truncate">{b.link || "-"}</td>
                <td className="py-2 px-4">{b.sort_order}</td>
                <td className="py-2 px-4">{b.active ? "Yes" : "No"}</td>
                <td className="py-2 px-4 text-right">
                  <button onClick={() => openEdit(b)} className="text-brand-orange font-medium mr-3">Edit</button>
                  <button onClick={() => handleDelete(b.id)} className="text-red-500 font-medium">Delete</button>
                </td>
              </tr>
            ))}
            {banners.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-400">কোনো banner নেই</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
