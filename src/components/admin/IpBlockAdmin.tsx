"use client";

import { useState } from "react";
import type { IpBlock } from "@/lib/types";

export default function IpBlockAdmin({ initialBlocks }: { initialBlocks: IpBlock[] }) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [ip, setIp] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/ip-block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip, reason: reason || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "সংরক্ষণ করা যায়নি");
        setSaving(false);
        return;
      }
      const refreshed = await fetch("/api/admin/ip-block");
      const refreshedData = await refreshed.json();
      setBlocks(refreshedData.blocks);
      setIp("");
      setReason("");
    } catch {
      setError("নেটওয়ার্ক সমস্যা");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("এই IP block টা মুছে ফেলতে চান?")) return;
    await fetch(`/api/admin/ip-block/${id}`, { method: "DELETE" });
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🚫 IP Block</h1>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl p-4 mb-6">
        নোট: এই তালিকাটি বর্তমানে কোথাও enforce করা হয় না — কোনো middleware এখনো আসা request গুলো এই তালিকার সাথে
        যাচাই করে না। এটি শুধুমাত্র ভবিষ্যতের enforcement ফিচারের জন্য management UI।
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <form onSubmit={handleAdd} className="grid md:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">IP Address *</span>
            <input required value={ip} onChange={(e) => setIp(e.target.value)} className="input" placeholder="203.0.113.5" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">Reason</span>
            <input value={reason} onChange={(e) => setReason(e.target.value)} className="input" placeholder="কারণ (ঐচ্ছিক)" />
          </label>
          <div className="flex items-end">
            <button disabled={saving} className="bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-60">
              {saving ? "Saving..." : "+ Add Block"}
            </button>
          </div>
          {error && <p className="text-red-600 text-sm md:col-span-3">{error}</p>}
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 px-4">IP</th>
              <th className="py-2 px-4">Reason</th>
              <th className="py-2 px-4">Created</th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((b) => (
              <tr key={b.id} className="border-b border-gray-100">
                <td className="py-2 px-4 font-mono">{b.ip}</td>
                <td className="py-2 px-4">{b.reason || "-"}</td>
                <td className="py-2 px-4 text-gray-500">{b.created_at}</td>
                <td className="py-2 px-4 text-right">
                  <button onClick={() => handleDelete(b.id)} className="text-red-500 font-medium">Unblock</button>
                </td>
              </tr>
            ))}
            {blocks.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-400">কোনো IP block করা নেই</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
