"use client";

import { useState, useEffect } from "react";
import type { Coupon } from "@/lib/types";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    id: 0,
    code: "",
    discount_type: "percent",
    discount_value: "",
    min_spend: "",
    max_uses: "",
    valid_until: "",
    is_active: true,
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    try {
      const res = await fetch("/api/admin/coupons");
      if (!res.ok) throw new Error("Failed to load coupons");
      const data = await res.json();
      setCoupons(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(coupon: Coupon) {
    setForm({
      id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_spend: coupon.min_spend.toString(),
      max_uses: coupon.max_uses?.toString() || "",
      valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString().slice(0, 16) : "",
      is_active: Boolean(coupon.is_active),
    });
    setShowModal(true);
  }

  function handleNew() {
    setForm({
      id: 0,
      code: "",
      discount_type: "percent",
      discount_value: "",
      min_spend: "0",
      max_uses: "",
      valid_until: "",
      is_active: true,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const url = form.id === 0 ? "/api/admin/coupons" : `/api/admin/coupons/${form.id}`;
      const method = form.id === 0 ? "POST" : "PUT";
      const payload = {
        ...form,
        discount_value: parseFloat(form.discount_value),
        min_spend: parseFloat(form.min_spend),
        max_uses: form.max_uses ? parseInt(form.max_uses, 10) : null,
        valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save coupon");
      }

      setShowModal(false);
      fetchCoupons();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchCoupons();
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <button
          onClick={handleNew}
          className="bg-brand-orange text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-orange-dark"
        >
          Add Coupon
        </button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-medium text-gray-500">Code</th>
              <th className="p-4 font-medium text-gray-500">Discount</th>
              <th className="p-4 font-medium text-gray-500">Min Spend</th>
              <th className="p-4 font-medium text-gray-500">Uses</th>
              <th className="p-4 font-medium text-gray-500">Valid Until</th>
              <th className="p-4 font-medium text-gray-500">Status</th>
              <th className="p-4 font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-semibold">{coupon.code}</td>
                <td className="p-4">
                  {coupon.discount_value} {coupon.discount_type === "percent" ? "%" : "৳"}
                </td>
                <td className="p-4">৳{coupon.min_spend}</td>
                <td className="p-4">
                  {coupon.uses} / {coupon.max_uses || "∞"}
                </td>
                <td className="p-4">
                  {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : "Never"}
                </td>
                <td className="p-4">
                  {coupon.is_active ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Active</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Inactive</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(coupon)} className="text-brand-orange hover:underline mr-4">Edit</button>
                  <button onClick={() => handleDelete(coupon.id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">No coupons found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{form.id === 0 ? "New Coupon" : "Edit Coupon"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Coupon Code *</span>
                <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input uppercase" placeholder="e.g. SAVE20" />
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Discount Type *</span>
                  <select required value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as any })} className="input">
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Discount Value *</span>
                  <input required type="number" step="0.01" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} className="input" placeholder="e.g. 10" />
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Minimum Spend (৳) *</span>
                <input required type="number" step="0.01" value={form.min_spend} onChange={(e) => setForm({ ...form, min_spend: e.target.value })} className="input" />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Max Uses (Optional)</span>
                  <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} className="input" placeholder="e.g. 100" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Valid Until (Optional)</span>
                  <input type="datetime-local" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} className="input" />
                </label>
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
