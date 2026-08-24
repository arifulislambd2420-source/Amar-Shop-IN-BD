import { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/site-config";
import { SHIPPING_FEE } from "@/lib/format";

export const metadata: Metadata = {
  title: "ডেলিভারি পলিসি ও চার্জ (Delivery Policy)",
  description: "আমারশপ — দ্রুততম সময়ে সারাদেশে হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা।",
};

export default function DeliveryPolicyPage() {
  return (
    <div className="container-x py-10 max-w-4xl">
      <nav className="text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-orange">হোম</Link> &gt; <span>ডেলিভারি পলিসি</span>
      </nav>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-10 shadow-xs space-y-6 text-gray-700 leading-relaxed">
        <h1 className="text-3xl font-bold text-gray-900 border-b border-gray-100 pb-4">
          ডেলিভারি পলিসি ও চার্জ — <span className="text-brand-orange">{SITE_CONFIG.name}</span>
        </h1>

        <p className="text-gray-600">
          গ্রাহকদের কাছে দ্রুত এবং নিরাপদভাবে পণ্য পৌঁছানো আমাদের প্রধান দায়িত্ব। সারাদেশে কুরিয়ার সার্ভিসের মাধ্যমে হোম ডেলিভারি প্রদান করা হয়।
        </p>

        {/* Delivery Charges Box */}
        <div className="grid sm:grid-cols-2 gap-4 my-6">
          <div className="bg-orange-50/70 border border-orange-200 p-5 rounded-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2">
              <span>🏙️</span> ঢাকা সিটির ভিতরে
            </h3>
            <p className="text-2xl font-bold text-brand-orange mb-2">৳{SHIPPING_FEE}</p>
            <p className="text-xs text-gray-600">ডেলিভারি সময়: ২৪ থেকে ৪৮ ঘণ্টার মধ্যে সরাসরি হোম ডেলিভারি।</p>
          </div>
          <div className="bg-blue-50/70 border border-blue-200 p-5 rounded-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2">
              <span>🚚</span> ঢাকা সিটির বাইরে (সারাদেশ)
            </h3>
            <p className="text-2xl font-bold text-blue-600 mb-2">৳120</p>
            <p className="text-xs text-gray-600">ডেলিভারি সময়: ২ থেকে ৩ কার্যদিবসের মধ্যে নির্ভরযোগ্য কুরিয়ারে হোম ডেলিভারি।</p>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">ক্যাশ অন ডেলিভারি (COD)</h2>
          <p>
            আমরা সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা প্রদান করি। অর্থাৎ পণ্য হাতে পেয়ে চেক করে ডেলিভারি ম্যানের কাছে সম্পূর্ণ মূল্য পরিশোধ করতে পারবেন।
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">ডেলিভারি গ্রহণের সময় করণীয়</h2>
          <ul className="list-disc list-inside space-y-1.5 text-sm pl-2">
            <li>ডেলিভারি রাইডারের উপস্থিতিতে পার্সেল খুলে পণ্যের সিল ও কোয়ালিটি ঠিক আছে কি না তা দেখে নিন।</li>
            <li>প্যাকেজ ভাঙ্গা বা ফুটো পেলে তৎক্ষণাৎ ডেলিভারি ম্যানের সামনে আমাদের হেল্পলাইনে কল করে জানান।</li>
            <li>যেকোনো ধরণের সমস্যা হলে পার্সেল রিসিভ না করে ফেরত পাঠাতে পারেন।</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-gray-100 pt-4">
          <h2 className="text-xl font-bold text-gray-900">যোগাযোগ</h2>
          <p className="text-sm">
            ডেলিভারি সংক্রান্ত যেকোনো জিজ্ঞাসার জন্য কল করুন:{" "}
            <a href={`tel:${SITE_CONFIG.supportPhoneRaw}`} className="text-brand-orange font-semibold">
              {SITE_CONFIG.supportPhone}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
