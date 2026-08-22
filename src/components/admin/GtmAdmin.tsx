"use client";

import { useState } from "react";

export default function GtmAdmin({ initialGtmId }: { initialGtmId: string }) {
  const [gtmId, setGtmId] = useState(initialGtmId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/gtm", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gtm_id: gtmId.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "সংরক্ষণ করা যায়নি");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">🔖 G. Pixel and GTM</h1>
      <p className="text-sm text-gray-500 mb-6">
        Google Tag Manager Container ID বসান। সেভ করলে সব পাবলিক পেজে GTM script যুক্ত হবে। খালি রাখলে কোনো script যুক্ত
        হবে না।
      </p>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-4">সংরক্ষণ সফল হয়েছে</p>}

      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl p-5 max-w-xl">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">GTM Container ID</span>
          <input
            value={gtmId}
            onChange={(e) => setGtmId(e.target.value)}
            className="input"
            placeholder="GTM-XXXXXXX"
          />
          <span className="text-xs text-gray-400">খালি রাখলে GTM বন্ধ থাকবে।</span>
        </label>
        <div className="mt-4">
          <button
            disabled={saving}
            className="bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
