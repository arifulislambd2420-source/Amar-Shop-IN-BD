"use client";

import { useState } from "react";

type FormState = {
  mail_mailer: string;
  mail_host: string;
  mail_port: string;
  mail_username: string;
  mail_password: string;
  mail_encryption: "ssl" | "tls";
  mail_from_address: string;
  mail_from_name: string;
};

export default function SmtpAdmin({ initialSettings }: { initialSettings: Record<string, string | null> }) {
  const [form, setForm] = useState<FormState>({
    mail_mailer: initialSettings.mail_mailer || "smtp",
    mail_host: initialSettings.mail_host || "",
    mail_port: initialSettings.mail_port || "587",
    mail_username: initialSettings.mail_username || "",
    mail_password: initialSettings.mail_password || "",
    mail_encryption: (initialSettings.mail_encryption as "ssl" | "tls") || "tls",
    mail_from_address: initialSettings.mail_from_address || "",
    mail_from_name: initialSettings.mail_from_name || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/smtp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          mail_port: parseInt(form.mail_port, 10) || 0,
        }),
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
      <h1 className="text-2xl font-bold mb-2">✉️ Mail SMTP Settings</h1>
      <p className="text-sm text-gray-500 mb-6">
        এই সেটিংস শুধু সংরক্ষণ করা হয় — এই অ্যাপে এখনো কোনো ইমেইল পাঠানোর কোড নেই, তাই এই তথ্য দিয়ে বাস্তবে কোনো ইমেইল
        পাঠানো হবে না। ভবিষ্যতের feature এর জন্য প্রস্তুতিমূলক storage।
      </p>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-4">সংরক্ষণ সফল হয়েছে</p>}

      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl p-5 grid md:grid-cols-2 gap-4 max-w-3xl">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Mail Mailer</span>
          <input value={form.mail_mailer} onChange={(e) => setForm({ ...form, mail_mailer: e.target.value })} className="input" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Mail Host</span>
          <input required value={form.mail_host} onChange={(e) => setForm({ ...form, mail_host: e.target.value })} className="input" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Mail Port</span>
          <input required type="number" value={form.mail_port} onChange={(e) => setForm({ ...form, mail_port: e.target.value })} className="input" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Mail Encryption</span>
          <select
            value={form.mail_encryption}
            onChange={(e) => setForm({ ...form, mail_encryption: e.target.value as "ssl" | "tls" })}
            className="input"
          >
            <option value="tls">tls</option>
            <option value="ssl">ssl</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Mail Username</span>
          <input value={form.mail_username} onChange={(e) => setForm({ ...form, mail_username: e.target.value })} className="input" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Mail Password</span>
          <input
            type="password"
            value={form.mail_password}
            onChange={(e) => setForm({ ...form, mail_password: e.target.value })}
            className="input"
            placeholder={initialSettings.mail_password ? "পরিবর্তন না করলে খালি রাখুন" : ""}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Mail From Address</span>
          <input required type="email" value={form.mail_from_address} onChange={(e) => setForm({ ...form, mail_from_address: e.target.value })} className="input" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Mail From Name</span>
          <input required value={form.mail_from_name} onChange={(e) => setForm({ ...form, mail_from_name: e.target.value })} className="input" />
        </label>
        <div className="md:col-span-2">
          <button disabled={saving} className="bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-60">
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}
