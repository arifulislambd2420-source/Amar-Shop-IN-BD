"use client";

import { useState, useEffect } from "react";
import type { FlashSale, Product } from "@/lib/types";

export default function AdminFlashSalesPage() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    id: 0,
    title: "",
    end_time: "",
    is_active: false,
    items: [] as { product_id: number; flash_price: string; product_name?: string }[],
  });

  useEffect(() => {
    fetchFlashSales();
    fetchProducts();
  }, []);

  async function fetchFlashSales() {
    try {
      const res = await fetch("/api/admin/flash-sales");
      if (!res.ok) throw new Error("Failed to load flash sales");
      const data = await res.json();
      setFlashSales(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) return;
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit(fs: FlashSale) {
    setForm({
      id: fs.id,
      title: fs.title,
      end_time: fs.end_time ? new Date(fs.end_time).toISOString().slice(0, 16) : "",
      is_active: fs.is_active,
      items: fs.items?.map((i) => ({ product_id: i.product_id, flash_price: i.flash_price.toString(), product_name: (i as any).product_name })) || [],
    });
    setShowModal(true);
  }

  function handleNew() {
    setForm({
      id: 0,
      title: "",
      end_time: "",
      is_active: true,
      items: [],
    });
    setShowModal(true);
  }

  function addItem() {
    setForm({ ...form, items: [...form.items, { product_id: 0, flash_price: "" }] });
  }

  function updateItem(index: number, field: string, value: any) {
    const newItems = [...form.items];
    (newItems[index] as any)[field] = value;
    setForm({ ...form, items: newItems });
  }

  function removeItem(index: number) {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const url = form.id === 0 ? "/api/admin/flash-sales" : `/api/admin/flash-sales/${form.id}`;
      const method = form.id === 0 ? "POST" : "PUT";
      const payload = {
        title: form.title,
        end_time: new Date(form.end_time).toISOString(),
        is_active: form.is_active,
        items: form.items.map(i => ({ product_id: i.product_id, flash_price: parseFloat(i.flash_price) }))
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save flash sale");
      }

      setShowModal(false);
      fetchFlashSales();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this flash sale?")) return;
    try {
      const res = await fetch(`/api/admin/flash-sales/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchFlashSales();
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Flash Sales</h1>
        <button
          onClick={handleNew}
          className="bg-brand-orange text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-orange-dark"
        >
          Create Flash Sale
        </button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-medium text-gray-500">Title</th>
              <th className="p-4 font-medium text-gray-500">End Time</th>
              <th className="p-4 font-medium text-gray-500">Items</th>
              <th className="p-4 font-medium text-gray-500">Status</th>
              <th className="p-4 font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flashSales.map((fs) => (
              <tr key={fs.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-semibold">{fs.title}</td>
                <td className="p-4">{new Date(fs.end_time).toLocaleString()}</td>
                <td className="p-4">{fs.items?.length || 0} products</td>
                <td className="p-4">
                  {fs.is_active ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Active</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Inactive</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(fs)} className="text-brand-orange hover:underline mr-4">Edit</button>
                  <button onClick={() => handleDelete(fs.id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {flashSales.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No flash sales found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{form.id === 0 ? "New Flash Sale" : "Edit Flash Sale"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Title *</span>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="e.g. Eid Mega Sale" />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">End Time *</span>
                <input required type="datetime-local" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="input" />
              </label>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Products</span>
                  <button type="button" onClick={addItem} className="text-sm text-brand-orange hover:underline font-medium">+ Add Product</button>
                </div>
                
                <div className="flex flex-col gap-3">
                  {form.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center bg-gray-50 p-2 rounded">
                      <select 
                        required
                        className="input flex-1"
                        value={item.product_id}
                        onChange={(e) => updateItem(index, "product_id", parseInt(e.target.value, 10))}
                      >
                        <option value={0}>Select Product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (৳{p.sale_price || p.price})</option>
                        ))}
                      </select>
                      <input 
                        required
                        type="number"
                        step="0.01"
                        placeholder="Flash Price (৳)"
                        className="input w-32"
                        value={item.flash_price}
                        onChange={(e) => updateItem(index, "flash_price", e.target.value)}
                      />
                      <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-2">✕</button>
                    </div>
                  ))}
                  {form.items.length === 0 && <p className="text-sm text-gray-500 italic">No products added yet.</p>}
                </div>
              </div>

              <label className="flex items-center gap-2 mt-2">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-5 h-5 accent-brand-orange" />
                <span className="font-medium">Active</span>
              </label>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-orange text-white font-medium hover:bg-brand-orange-dark rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
