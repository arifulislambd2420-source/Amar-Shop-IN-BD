"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-navy px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-1 text-center">
          আমার<span className="text-brand-orange">শপ</span> Admin
        </h1>
        <p className="text-gray-500 text-sm text-center mb-6">লগইন করুন</p>
        <label className="flex flex-col gap-1 text-sm mb-3">
          <span className="font-medium text-gray-700">Username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="input" required />
        </label>
        <label className="flex flex-col gap-1 text-sm mb-4">
          <span className="font-medium text-gray-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
          />
        </label>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <button
          disabled={loading}
          className="w-full bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg"
        >
          {loading ? "..." : "Login"}
        </button>
        <p className="text-xs text-gray-400 text-center mt-4">Default: admin / admin123</p>
      </form>
    </div>
  );
}
