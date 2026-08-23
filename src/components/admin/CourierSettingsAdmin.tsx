"use client";

import { useState, useEffect } from "react";

export default function CourierSettingsAdmin() {
  const [form, setForm] = useState({
    steadfast_api_key: "",
    steadfast_secret_key: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings/courier")
      .then((res) => res.json())
      .then((data) => {
        setForm({
          steadfast_api_key: data.steadfast_api_key || "",
          steadfast_secret_key: data.steadfast_secret_key || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/settings/courier", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save settings");
      }

      setSuccess("Settings saved successfully.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-gray-500">Loading courier settings...</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">🚚 Courier API Settings</h1>
      
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-bold mb-4">Steadfast Courier Integration</h2>
        <p className="text-sm text-gray-500 mb-6">
          Steadfast is used for automatic order parcel creation and order tracking.
          Get these keys from your Steadfast merchant dashboard.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">API Key</span>
            <input
              type="text"
              value={form.steadfast_api_key}
              onChange={(e) => setForm({ ...form, steadfast_api_key: e.target.value })}
              className="input bg-gray-50 border-gray-300 rounded px-3 py-2"
              placeholder="Enter your Steadfast API-Key"
              required
            />
          </label>
          
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">Secret Key</span>
            <input
              type="password"
              value={form.steadfast_secret_key}
              onChange={(e) => setForm({ ...form, steadfast_secret_key: e.target.value })}
              className="input bg-gray-50 border-gray-300 rounded px-3 py-2"
              placeholder={form.steadfast_secret_key === "********" ? "******** (hidden)" : "Enter your Steadfast Secret-Key"}
              required
            />
          </label>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold px-6 py-2 rounded-lg text-sm disabled:opacity-60 transition-colors"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
