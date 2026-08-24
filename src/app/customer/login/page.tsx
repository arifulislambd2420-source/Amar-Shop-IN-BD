"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"otp" | "password">("otp");
  
  // OTP states
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [requireName, setRequireName] = useState(false);
  const [name, setName] = useState("");
  
  // Password states
  const [password, setPassword] = useState("");

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        return;
      }
      setOtpSent(true);
      // In a real app, an SMS is sent. Here we alert for testing:
      alert("Test OTP is 1234");
    } catch {
      setError("Network Error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, name: requireName ? name : undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.requireRegistration) {
          setRequireName(true);
        } else {
          setError(data.error || "Failed to verify OTP");
        }
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Network Error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login Failed");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Network Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-x py-12 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">Login / Register</h1>
      
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setMode("otp")}
          className={`py-2 px-1 border-b-2 font-medium ${mode === "otp" ? "border-brand-orange text-brand-orange" : "border-transparent text-gray-500"}`}
        >
          OTP Login
        </button>
        <button 
          onClick={() => setMode("password")}
          className={`py-2 px-1 border-b-2 font-medium ${mode === "password" ? "border-brand-orange text-brand-orange" : "border-transparent text-gray-500"}`}
        >
          Password Login
        </button>
      </div>

      {mode === "password" ? (
        <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
          <Field label="Mobile Number" required>
            <input
              required
              type="tel"
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Password" required>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </Field>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-60 text-white font-semibold py-3 rounded-lg"
          >
            {submitting ? "Processing..." : "Login"}
          </button>
        </form>
      ) : (
        <>
          {!otpSent ? (
            <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
              <Field label="Mobile Number" required>
                <input
                  required
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input"
                />
              </Field>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-60 text-white font-semibold py-3 rounded-lg"
              >
                {submitting ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
              <p className="text-sm text-green-600">OTP has been sent to {phone}.</p>
              <Field label="Enter OTP" required>
                <input
                  required
                  type="text"
                  maxLength={4}
                  placeholder="1234"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input tracking-widest text-lg font-bold"
                />
              </Field>
              {requireName && (
                <Field label="Your Name (New Account)" required>
                  <input
                    required
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                  />
                </Field>
              )}
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-60 text-white font-semibold py-3 rounded-lg"
              >
                {submitting ? "Verifying..." : requireName ? "Complete Registration" : "Verify & Login"}
              </button>
            </form>
          )}
        </>
      )}

      {mode === "password" && (
        <p className="text-center text-sm text-gray-600 mt-6">
          একাউন্ট নেই?{" "}
          <Link href="/customer/register" className="text-brand-orange font-semibold hover:underline">
            Register Now
          </Link>
        </p>
      )}
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

