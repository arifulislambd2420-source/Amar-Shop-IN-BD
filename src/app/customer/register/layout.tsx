import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "নতুন একাউন্ট খুলুন (Sign Up) — আমারশপ",
  description: "সহজে নতুন একাউন্ট খুলে অর্ডার ট্র্যাক ও নিয়মিত আপডেট পান।",
};

export default function CustomerRegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
