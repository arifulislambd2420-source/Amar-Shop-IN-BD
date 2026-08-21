"use client";

import { useState } from "react";
import { formatTaka } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function TrackPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ order: Order; items: OrderItem[] } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "খুঁজে পাওয়া যায়নি");
      } else {
        setResult(data);
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-x py-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 text-center">Track Your Order</h1>
      <p className="text-gray-500 text-center mb-6">Phone Number দিয়ে (Order ID এর সাথে হলে অন্তত শেষ ৪ ডিজিট) অর্ডার status দেখুন</p>

      <form onSubmit={handleSubmit} className="border border-gray-200 rounded-xl p-5 flex flex-col gap-3 mb-6">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Order ID (ঐচ্ছিক)</span>
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="e.g. 1234" className="input" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">
            Phone Number <span className="text-brand-orange">*</span>
          </span>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01XXXXXXXXX"
            className="input"
          />
        </label>
        <p className="text-xs text-gray-400">Phone Number আবশ্যক (Order ID থাকলে সাথে শেষ ৪ ডিজিটই যথেষ্ট)</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          disabled={loading}
          className="bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg"
        >
          {loading ? "খোঁজা হচ্ছে..." : "Track Order"}
        </button>
      </form>

      {result && (
        <div className="border border-gray-200 rounded-xl p-5">
          <div className="flex justify-between items-center mb-3">
            <div className="font-semibold">Order #{result.order.id}</div>
            <span className="text-xs font-semibold bg-brand-orange/10 text-brand-orange px-2 py-1 rounded">
              {STATUS_LABEL[result.order.status] || result.order.status}
            </span>
          </div>
          <div className="flex flex-col gap-2 mb-3">
            {result.items.map((it) => (
              <div key={it.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{it.product_name} × {it.quantity}</span>
                <span>{formatTaka(it.line_total)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
            <span>মোট</span>
            <span className="text-brand-orange">{formatTaka(result.order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
