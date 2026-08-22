"use client";

import { useState } from "react";
import type { ReviewWithProduct } from "@/lib/reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500">
      {"★".repeat(rating)}
      <span className="text-gray-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function ReviewsAdmin({ initialReviews }: { initialReviews: ReviewWithProduct[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function setApproved(id: number, approved: boolean) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      if (res.ok) {
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved: approved ? 1 : 0 } : r)));
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("এই review টা delete করতে চান?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">⭐ Reviews</h1>
      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 px-4">Product</th>
              <th className="py-2 px-4">Customer</th>
              <th className="py-2 px-4">Rating</th>
              <th className="py-2 px-4">Comment</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 align-top">
                <td className="py-2 px-4">{r.product_name}</td>
                <td className="py-2 px-4">{r.customer_name}</td>
                <td className="py-2 px-4"><Stars rating={r.rating} /></td>
                <td className="py-2 px-4 max-w-xs">{r.comment || <span className="text-gray-400">—</span>}</td>
                <td className="py-2 px-4">
                  {r.approved ? (
                    <span className="text-green-600 font-medium">Approved</span>
                  ) : (
                    <span className="text-gray-400 font-medium">Pending</span>
                  )}
                </td>
                <td className="py-2 px-4 text-gray-500">{r.created_at}</td>
                <td className="py-2 px-4 text-right whitespace-nowrap">
                  {r.approved ? (
                    <button
                      disabled={busyId === r.id}
                      onClick={() => setApproved(r.id, false)}
                      className="text-gray-500 font-medium mr-3 disabled:opacity-60"
                    >
                      Unapprove
                    </button>
                  ) : (
                    <button
                      disabled={busyId === r.id}
                      onClick={() => setApproved(r.id, true)}
                      className="text-brand-orange font-medium mr-3 disabled:opacity-60"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    disabled={busyId === r.id}
                    onClick={() => handleDelete(r.id)}
                    className="text-red-500 font-medium disabled:opacity-60"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={7} className="py-4 text-center text-gray-400">কোনো review নেই</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
