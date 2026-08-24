import { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "রিটার্ন ও রিফান্ড পলিসি (Return & Refund Policy)",
  description: "আমারশপ — সহজ ও ঝামেলাহীন রিটার্ন এবং রিফান্ড পলিসি।",
};

export default function ReturnsPolicyPage() {
  return (
    <div className="container-x py-10 max-w-4xl">
      <nav className="text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-orange">হোম</Link> &gt; <span>রিটার্ন ও রিফান্ড পলিসি</span>
      </nav>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-10 shadow-xs space-y-6 text-gray-700 leading-relaxed">
        <h1 className="text-3xl font-bold text-gray-900 border-b border-gray-100 pb-4">
          রিটার্ন ও রিফান্ড পলিসি (Return & Refund)
        </h1>

        <p className="text-gray-600">
          <strong className="text-gray-900">{SITE_CONFIG.name}</strong> গ্রাহকদের শতভাগ সন্তুষ্টি নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ। পণ্য সংক্রান্ত যেকোনো ত্রুটির জন্য আমাদের রয়েছে সহজ রিটার্ন সুবিধা।
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">১. কোন ক্ষেত্রে পণ্য রিটার্ন গ্রহণযোগ্য?</h2>
          <ul className="list-disc list-inside space-y-1 text-sm pl-2">
            <li>পণ্য ভাঙা, ক্ষতিগ্রস্ত বা লিক করা অবস্থায় পৌঁছালে।</li>
            <li>ভুল পণ্য বা মেয়াদোত্তীর্ণ পণ্য ডেলিভারি পেলে।</li>
            <li>পণ্যের মান বা পরিমাণে ঘাটতি থাকলে।</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">২. রিটার্নের সময়সীমা</h2>
          <p className="text-sm">
            পণ্য গ্রহণের সময় ডেলিভারি ম্যানের সামনে চেক করুন। ডেলিভারি সম্পন্ন হয়ে যাওয়ার পর কোনো সমস্যা পেলে পণ্য হাতে পাওয়ার <strong>২৪ থেকে ৪৮ ঘণ্টার মধ্যে</strong> আমাদের হেল্পলাইনে ছবি/ভিডিও সহ অভিযোগ জানাতে হবে।
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">৩. রিফান্ড প্রক্রিয়া</h2>
          <p className="text-sm">
            রিটার্ন করা পণ্য আমাদের কাছে পৌঁছানোর পর যাচাই করে ৩ থেকে ৫ কার্যদিবসের মধ্যে গ্রাহকের বিকাশ, নগদ বা ব্যাংক একাউন্টে রিফান্ডের টাকা পাঠিয়ে দেওয়া হবে।
          </p>
        </section>

        <section className="space-y-3 border-t border-gray-100 pt-4">
          <h2 className="text-xl font-bold text-gray-900">রিটার্নের জন্য যোগাযোগ</h2>
          <p className="text-sm">
            রিটার্ন বা রিফান্ড রিকোয়েস্টের জন্য কল বা হোয়াটসঅ্যাপ করুন:{" "}
            <a href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-green-600 font-semibold">
              WhatsApp এ মেসেজ দিন
            </a>{" "}
            অথবা কল করুন:{" "}
            <a href={`tel:${SITE_CONFIG.supportPhoneRaw}`} className="text-brand-orange font-semibold">
              {SITE_CONFIG.supportPhone}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
