import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "কাস্টমার লগইন — আমারশপ",
  description: "আপনার একাউন্টে লগইন করুন বা ওটিপি দিয়ে প্রবেশ করুন।",
};

export default function CustomerLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
