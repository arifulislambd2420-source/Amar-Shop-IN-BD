import { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "ব্যবহারের শর্তাবলী (Terms of Service)",
  description: "আমারশপ — ওয়েবসাইট ব্যবহারের নিয়ম ও শর্তাবলী।",
};

export default function TermsPage() {
  return (
    <div className="container-x py-10 max-w-4xl">
      <nav className="text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-orange">হোম</Link> &gt; <span>ব্যবহারের শর্তাবলী</span>
      </nav>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-10 shadow-xs space-y-6 text-gray-700 leading-relaxed">
        <h1 className="text-3xl font-bold text-gray-900 border-b border-gray-100 pb-4">
          ব্যবহারের শর্তাবলী (Terms & Conditions)
        </h1>

        <p className="text-gray-600">
          <strong className="text-gray-900">{SITE_CONFIG.name}</strong> ওয়েবসাইট ব্রাউজ বা পণ্য ক্রয়ের মাধ্যমে আপনি নিচের শর্তাবলীর সাথে একমত প্রকাশ করছেন।
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">১. অর্ডার ও মূল্য নির্ধারণ</h2>
          <p className="text-sm">
            ওয়েবসাইটে প্রদর্শিত সকল পণ্যের মূল্য বাংলাদেশি টাকায় (BDT) নির্ধারিত। স্টক ফুরিয়ে যাওয়া বা কারিগরি ত্রুটির কারণে কোনো পণ্যের মূল্য বা স্টকে পরিবর্তন এলে কোম্পানি অর্ডারটি সংশোধন বা বাতিল করার অধিকার সংরক্ষণ করে।
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">২. পেমেন্ট ও ক্যাশ অন ডেলিভারি</h2>
          <p className="text-sm">
            গ্রাহক ক্যাশ অন ডেলিভারি অথবা অনুমোদিত মোবাইল ব্যাংকিং (বিকাশ, নগদ)/কার্ডের মাধ্যমে পেমেন্ট করতে পারবেন। অর্ডার কনফার্মেশনের জন্য প্রয়োজনে আমাদের প্রতিনিধি গ্রাহককে ফোন করে যাচাই করতে পারেন।
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">৩. কাস্টমার দায়বদ্ধতা</h2>
          <p className="text-sm">
            অর্ডার দেওয়ার সময় সঠিক মোবাইল নম্বর ও সম্পূর্ণ ডেলিভারি ঠিকানা প্রদান করা গ্রাহকের দায়িত্ব। ভুল তথ্যের কারণে ডেলিভারি বিলম্বিত হলে কর্তৃপক্ষ দায়ী থাকবে না।
          </p>
        </section>

        <section className="space-y-3 border-t border-gray-100 pt-4">
          <h2 className="text-xl font-bold text-gray-900">যোগাযোগ ও সহায়তা</h2>
          <p className="text-sm">
            শর্তাবলী বিষয়ে যেকোনো তথ্যের জন্য কল করুন:{" "}
            <a href={`tel:${SITE_CONFIG.supportPhoneRaw}`} className="text-brand-orange">
              {SITE_CONFIG.supportPhone}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
