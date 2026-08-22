"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ phone: "", password: "" });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login সম্পন্ন করা যায়নি");
        setSubmitting(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন");
      setSubmitting(false);
    }
  }

  return (
    <div className="container-x py-12 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Login করুন</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Mobile Number" required>
          <input
            required
            type="tel"
            placeholder="01XXXXXXXXX"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Password" required>
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="input"
          />
        </Field>

        <div className="text-right text-sm">
          <Link href="#" className="text-brand-orange hover:underline">
            Forgot Password?
          </Link>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-60 text-white font-semibold py-3 rounded-lg"
        >
          {submitting ? "Login হচ্ছে..." : "Login"}
        </button>

        <p className="text-center text-sm text-gray-600">
          একাউন্ট নেই?{" "}
          <Link href="/customer/register" className="text-brand-orange font-semibold hover:underline">
            Register Now
          </Link>
        </p>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-gray-700">
        {label} {required && <span className="text-brand-orange">*</span>}
      </span>
      {children}
    </label>
  );
}
