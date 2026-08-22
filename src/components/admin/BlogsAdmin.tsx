"use client";

import { useState } from "react";
import type { Blog } from "@/lib/types";

type FormState = {
  id?: number;
  title: string;
  slug: string;
  cover: string;
  category: string;
  content: string;
  read_time: string;
  published_at: string;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  cover: "",
  category: "",
  content: "",
  read_time: "",
  published_at: today(),
};

export default function BlogsAdmin({ initialBlogs }: { initialBlogs: Blog[] }) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function openNew() {
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError("");
  }

  function openEdit(b: Blog) {
    setForm({
      id: b.id,
      title: b.title,
      slug: b.slug,
      cover: b.cover || "",
      category: b.category || "",
      content: b.content,
      read_time: b.read_time != null ? String(b.read_time) : "",
      published_at: b.published_at ? String(b.published_at).slice(0, 10) : today(),
    });
    setShowForm(true);
    setError("");
  }

  async function refresh() {
    const res = await fetch("/api/admin/blogs");
    const data = await res.json();
    setBlogs(data.blogs);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      title: form.title,
      slug: form.slug,
      cover: form.cover || null,
      category: form.category || null,
      content: form.content,
      read_time: form.read_time ? parseInt(form.read_time, 10) : null,
      published_at: form.published_at || today(),
    };
    try {
      const res = form.id
        ? await fetch(`/api/admin/blogs/${form.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/admin/blogs`, {
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
    if (!confirm("এই blog টা delete করতে চান?")) return;
    await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
    setBlogs((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📝 Blogs</h1>
        <button
          onClick={openNew}
          className="bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold px-4 py-2 rounded-lg text-sm"
        >
          + Add Blog
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Title *</span>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Slug *</span>
              <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Cover path</span>
              <input value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Category</span>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Read time (min)</span>
              <input type="number" min={1} value={form.read_time} onChange={(e) => setForm({ ...form, read_time: e.target.value })} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Published at</span>
              <input type="date" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm md:col-span-2">
              <span className="font-medium text-gray-700">Content *</span>
              <textarea required rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input" />
            </label>
            {error && <p className="text-red-600 text-sm md:col-span-2">{error}</p>}
            <div className="md:col-span-2 flex gap-3">
              <button disabled={saving} className="bg-brand-orange text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-60">
                {saving ? "Saving..." : form.id ? "Update Blog" : "Create Blog"}
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
              <th className="py-2 px-4">Title</th>
              <th className="py-2 px-4">Slug</th>
              <th className="py-2 px-4">Category</th>
              <th className="py-2 px-4">Published</th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((b) => (
              <tr key={b.id} className="border-b border-gray-100">
                <td className="py-2 px-4">{b.title}</td>
                <td className="py-2 px-4">{b.slug}</td>
                <td className="py-2 px-4">{b.category || "-"}</td>
                <td className="py-2 px-4">{String(b.published_at).slice(0, 10)}</td>
                <td className="py-2 px-4 text-right">
                  <button onClick={() => openEdit(b)} className="text-brand-orange font-medium mr-3">Edit</button>
                  <button onClick={() => handleDelete(b.id)} className="text-red-500 font-medium">Delete</button>
                </td>
              </tr>
            ))}
            {blogs.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-400">কোনো blog নেই</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
