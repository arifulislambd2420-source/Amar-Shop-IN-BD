"use client";

import { useState } from "react";
import type { FraudApiConfig } from "@/lib/types";

type RowState = {
  type: "free" | "paid";
  api_url: string;
  api_key: string;
  active: boolean;
  showKey: boolean;
};

function toRowState(type: "free" | "paid", c?: FraudApiConfig): RowState {
  return {
    type,
    api_url: c?.api_url || "",
    api_key: c?.api_key || "",
    active: !!c?.active,
    showKey: false,
  };
}

export default function FraudApiAdmin({ initialConfigs }: { initialConfigs: FraudApiConfig[] }) {
  const free = initialConfigs.find((c) => c.type === "free");
  const paid = initialConfigs.find((c) => c.type === "paid");
  const [rows, setRows] = useState<RowState[]>([toRowState("free", free), toRowState("paid", paid)]);
  const [saving, setSaving] = useState<"free" | "paid" | null>(null);
  const [error, setError] = useState("");

  function updateRow(type: "free" | "paid", patch: Partial<RowState>) {
    setRows((prev) => prev.map((r) => (r.type === type ? { ...r, ...patch } : r)));
  }

  async function handleSave(row: RowState) {
    setError("");
    setSaving(row.type);
    try {
      const res = await fetch("/api/admin/settings/fraud-api", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: row.type,
          api_url: row.api_url,
          api_key: row.api_key,
          active: row.active ? 1 : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "সংরক্ষণ করা যায়নি");
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">🛡️ Fraud API Settings</h1>
      <p className="text-sm text-gray-500 mb-6">
        এখানে শুধু configuration সংরক্ষণ করা হয় — এই তথ্য দিয়ে এখনো কোনো প্রকৃত fraud-check API কল করা হয় না। ভবিষ্যতে
        ইন্টিগ্রেশনের জন্য প্রস্তুতিমূলক storage।
      </p>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="flex flex-col gap-5">
        {rows.map((row) => (
          <div key={row.type} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  row.type === "free" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                }`}
              >
                {row.type === "free" ? "Free" : "Paid"}
              </span>
              <span className="text-sm font-medium text-gray-700">Fraud Check API</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">API URL</span>
                <input
                  value={row.api_url}
                  onChange={(e) => updateRow(row.type, { api_url: e.target.value })}
                  className="input"
                  placeholder="https://example.com/api/check"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">API Key</span>
                <div className="flex gap-2">
                  <input
                    type={row.showKey ? "text" : "password"}
                    value={row.api_key}
                    onChange={(e) => updateRow(row.type, { api_key: e.target.value })}
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => updateRow(row.type, { showKey: !row.showKey })}
                    className="border border-gray-300 px-3 rounded-lg text-xs"
                  >
                    {row.showKey ? "Hide" : "Show"}
                  </button>
                </div>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={row.active}
                  onChange={(e) => updateRow(row.type, { active: e.target.checked })}
                />
                <span className="font-medium text-gray-700">Active</span>
              </label>
            </div>
            <div className="mt-4">
              <button
                onClick={() => handleSave(row)}
                disabled={saving === row.type}
                className="bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-60"
              >
                {saving === row.type ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          disabled
          title="শীঘ্রই আসছে — বর্তমানে কোনো প্রকৃত vendor ইন্টিগ্রেশন নেই"
          className="border border-gray-300 text-gray-400 px-4 py-2 rounded-lg text-sm cursor-not-allowed bg-gray-50"
        >
          Buy API Key (Coming soon)
        </button>
        <button
          type="button"
          disabled
          title="শীঘ্রই আসছে — বর্তমানে কোনো প্রকৃত vendor ইন্টিগ্রেশন নেই"
          className="border border-gray-300 text-gray-400 px-4 py-2 rounded-lg text-sm cursor-not-allowed bg-gray-50"
        >
          Developer Support (Coming soon)
        </button>
      </div>
    </div>
  );
}
