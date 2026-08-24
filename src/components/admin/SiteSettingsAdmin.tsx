"use client";

import { useState } from "react";
import ImageUploader from "./ImageUploader";

export default function SiteSettingsAdmin({
  initialLogo,
  initialName,
}: {
  initialLogo: string;
  initialName: string;
}) {
  const [logo, setLogo] = useState(initialLogo);
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site_logo: logo, site_name: name }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "সংরক্ষণ করা যায়নি");
      else setSuccess(true);
    } catch {
      setError("নেটওয়ার্ক সমস্যা");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">🏷️ Site Setting</h1>
      <p className="text-sm text-gray-500 mb-6">
        সাইটের logo ও নাম এখান থেকে সেট করুন। Logo সেট করলে header, admin panel, invoice ও favicon-এ ব্যবহৃত হবে; খালি
        রাখলে টেক্সট logo দেখাবে।
      </p>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-4">সংরক্ষণ সফল হয়েছে</p>}

      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl p-5 max-w-xl flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Site Logo</span>
          <ImageUploader value={logo} onChange={setLogo} />
          <span className="text-xs text-gray-400">PNG/SVG recommended, transparent background, ~200×60.</span>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Site Name (logo না থাকলে দেখাবে)</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="আমারশপ" />
        </label>
        <div>
          <button
            disabled={saving}
            className="bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
