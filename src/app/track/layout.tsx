import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "লাইভ অর্ডার ট্র্যাকিং — আমারশপ",
  description: "আপনার ফোন নম্বর ও অর্ডার আইডি দিয়ে পার্সেলের লাইভ স্ট্যাটাস ট্র্যাক করুন।",
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
