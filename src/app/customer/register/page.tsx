"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PHONE_RE = /^0?1[0-9]{9,10}$/;

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", password: "" });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): string | null {
    if (!form.name.trim()) return "নাম দিন";
    if (!PHONE_RE.test(form.phone)) return "সঠিক ফোন নম্বর দিন (01XXXXXXXXX)";
    if (form.password.length < 6) return "Password কমপক্ষে ৬ অক্ষরের হতে হবে";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "রেজিস্ট্রেশন সম্পন্ন করা যায়নি");
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
      <h1 className="text-2xl font-bold mb-6">Register করুন</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Full Name" required>
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="input"
          />
        </Field>
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

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-60 text-white font-semibold py-3 rounded-lg"
        >
          {submitting ? "Register হচ্ছে..." : "Register"}
        </button>

        <p className="text-center text-sm text-gray-600">
          আগে থেকে একাউন্ট আছে?{" "}
          <Link href="/customer/login" className="text-brand-orange font-semibold hover:underline">
            Login here
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
