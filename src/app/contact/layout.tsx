import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "যোগাযোগ ও কাস্টমার কেয়ার — আমারশপ",
  description: "যেকোনো জিজ্ঞাসা, অর্ডার বা অভিযোগের জন্য আমাদের সাথে যোগাযোগ করুন।",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
