"use client";

import { useState } from "react";
import type { Review } from "@/lib/products";

export default function ProductReviews({ productId, initialReviews }: { productId: number, initialReviews: Review[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, customer_name: name, rating, comment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      setMessage("আপনার রিভিউ সাবমিট হয়েছে। এটি অ্যাডমিন অ্যাপ্রুভ করার পর দেখা যাবে।");
      setName("");
      setRating(5);
      setComment("");
      setShowForm(false);
    } catch (err: any) {
      setMessage(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">রিভিউ ও রেটিং ({reviews.length})</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-orange text-white px-4 py-2 rounded font-medium hover:bg-orange-600 transition"
        >
          রিভিউ লিখুন
        </button>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded">
          {message}
        </div>
      )}

      {showForm && (
        <form onSubmit={submitReview} className="mb-8 p-4 bg-gray-50 border rounded-lg">
          <h3 className="font-semibold mb-4">আপনার রিভিউ লিখুন</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">আপনার নাম <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-orange outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">রেটিং <span className="text-red-500">*</span></label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-orange outline-none"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (৫/৫)</option>
                <option value={4}>⭐⭐⭐⭐ (৪/৫)</option>
                <option value={3}>⭐⭐⭐ (৩/৫)</option>
                <option value={2}>⭐⭐ (২/৫)</option>
                <option value={1}>⭐ (১/৫)</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">আপনার মতামত</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-orange outline-none"
              placeholder="পণ্যটি সম্পর্কে আপনার মতামত লিখুন..."
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gray-900 text-white px-6 py-2 rounded font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "সাবমিট হচ্ছে..." : "সাবমিট করুন"}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-6">এখনো কোনো রিভিউ নেই। প্রথম রিভিউটি আপনিই লিখুন!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{review.customer_name}</span>
                <span className="text-yellow-400 text-sm">
                  {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                </span>
                <span className="text-gray-400 text-xs ml-auto">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.comment && <p className="text-gray-600 text-sm mt-2">{review.comment}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
