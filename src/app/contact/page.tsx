"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";

import { SITE_CONFIG } from "@/lib/site-config";

const POLICY_LINKS = [
  { href: "/about", label: "আমাদের সম্পর্কে" },
  { href: "/delivery", label: "ডেলিভারি পলিসি" },
  { href: "/returns", label: "রিটার্ন ও রিফান্ড" },
  { href: "/privacy", label: "প্রাইভেসি পলিসি" },
  { href: "/terms", label: "শর্তাবলী" },
  { href: "/contact", label: "যোগাযোগ" },
];

const formSchema = z.object({
  name: z.string().min(1, "নাম দিন"),
  phone: z.string().min(1, "ফোন নম্বর দিন"),
  email: z.string().email("সঠিক ইমেইল দিন"),
  subject: z.string().min(1, "বিষয় দিন"),
  message: z.string().min(1, "মেসেজ দিন"),
});

type FormState = z.infer<typeof formSchema>;
type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = { name: "", phone: "", email: "", subject: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    setServerError("");

    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "মেসেজ পাঠানো যায়নি — আবার চেষ্টা করুন");
        setStatus("error");
        return;
      }
      setForm(EMPTY_FORM);
      setStatus("success");
    } catch {
      setServerError("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন");
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-x py-10">
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {POLICY_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="px-4 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-brand-orange hover:text-brand-orange"
          >
            {l.label}
          </Link>
        ))}
      </div>

      <h1 className="text-2xl font-bold text-center mb-1">যোগাযোগ করুন</h1>
      <p className="text-gray-500 text-center mb-8">যেকোনো প্রশ্ন বা সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন</p>

      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
        <div className="border border-gray-200 rounded-xl p-5 flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
            <PhoneIcon />
          </div>
          <div>
            <div className="font-semibold text-gray-800">কল সেন্টার</div>
            <a href={`tel:${SITE_CONFIG.supportPhoneRaw}`} className="text-sm text-gray-500 hover:text-brand-orange">
              {SITE_CONFIG.supportPhone}
            </a>
          </div>
        </div>
        <div className="border border-gray-200 rounded-xl p-5 flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
            <MailIcon />
          </div>
          <div>
            <div className="font-semibold text-gray-800">ইমেইল সাপোর্ট</div>
            <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="text-sm text-gray-500 hover:text-brand-orange">
              {SITE_CONFIG.supportEmail}
            </a>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border border-gray-200 rounded-xl p-6 max-w-2xl mx-auto flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="পূর্ণ নাম" required error={errors.name}>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="input"
              placeholder="আপনার নাম"
            />
          </Field>
          <Field label="মোবাইল" required error={errors.phone}>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="input"
              placeholder="01XXXXXXXXX"
            />
          </Field>
        </div>
        <Field label="ইমেইল" required error={errors.email}>
          <input
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="input"
            placeholder="you@example.com"
          />
        </Field>
        <Field label="বিষয়" required error={errors.subject}>
          <input
            value={form.subject}
            onChange={(e) => update("subject", e.target.value)}
            className="input"
            placeholder="বিষয় লিখুন"
          />
        </Field>
        <Field label="মেসেজ" required error={errors.message}>
          <textarea
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            className="input min-h-[120px] resize-y"
            placeholder="আপনার মেসেজ লিখুন"
          />
        </Field>

        {status === "success" && (
          <p className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            মেসেজ পাঠানো হয়েছে! আমরা শীঘ্রই যোগাযোগ করব।
          </p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{serverError}</p>
        )}

        <button
          disabled={submitting}
          className="bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg"
        >
          {submitting ? "পাঠানো হচ্ছে..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-gray-700">
        {label} {required && <span className="text-brand-orange">*</span>}
      </span>
      {children}
      {error && <span className="text-red-600 text-xs">{error}</span>}
    </label>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  );
}
