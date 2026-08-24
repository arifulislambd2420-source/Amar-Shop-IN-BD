import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "চেকআউট — নিরাপদ ক্যাশ অন ডেলিভারি অর্ডার",
  description: "দ্রুত ও নিরাপদে ক্যাশ অন ডেলিভারিতে অর্ডার সম্পন্ন করুন।",
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
